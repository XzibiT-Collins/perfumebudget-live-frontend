import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, NotificationResponse } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { resolveWebSocketConfig } from '../services/websocketConfig.js';

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef<Client | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    try {
      const response = await notificationService.getNotifications(isInitial ? 0 : page);
      const newNotifications = response.data.content;
      
      if (isInitial) {
        setNotifications(newNotifications);
        setPage(1);
      } else {
        setNotifications((prev) => {
          // Merge and avoid duplicates by recipientId
          const existingIds = new Set(prev.map(n => n.recipientId));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.recipientId));
          return [...prev, ...uniqueNew];
        });
        setPage((prev) => prev + 1);
      }
      setHasMore(!response.data.isLast);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [page]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  const markAsRead = useCallback(async (recipientId: number) => {
    try {
      await notificationService.markAsRead(recipientId);
      setNotifications((prev) => 
        prev.map((n) => n.recipientId === recipientId ? { ...n, read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio playback blocked or failed', e);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.FRONT_DESK)) {
      fetchNotifications(true);
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]); // fetchNotifications is not in deps to avoid re-run on page change here

  useEffect(() => {
    console.log('[WebSocket] useEffect triggered. User:', user);
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.FRONT_DESK)) {
      console.log('[WebSocket] Connection aborted. Reason: User is either null or not authorized.');
      return;
    }

    const backendUrl = import.meta.env.VITE_API_BACKEND_URL;
    if (!backendUrl) {
      console.warn('[WebSocket] VITE_API_BACKEND_URL is not defined in .env');
      return;
    }

    let socketConfig;
    try {
      socketConfig = resolveWebSocketConfig({ backendUrl });
    } catch (error) {
      console.warn('[WebSocket] Unable to resolve websocket config', error);
      return;
    }

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          socketConfig.socketUrl,
          undefined,
          { withCredentials: socketConfig.withCredentials } as any
        ),
      debug: (str) => {
        // console.log('[STOMP DEBUG]', str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WebSocket] STOMP connected successfully.');
        client.subscribe('/user/queue/notifications', (message) => {
          console.log('[WebSocket] Message received:', message.body);
          if (message.body) {
            try {
              const payload = JSON.parse(message.body) as NotificationResponse;
              
              setNotifications((prev) => {
                const exists = prev.some(n => n.recipientId === payload.recipientId);
                if (exists) return prev;
                return [payload, ...prev];
              });
              setUnreadCount((prev) => prev + 1);
              
              playSound();

              toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-sm w-full bg-white dark:bg-zinc-900 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
                >
                  <div 
                    className="flex-1 w-0 p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-l-2xl"
                    onClick={() => {
                      toast.dismiss(t.id);
                      markAsRead(payload.recipientId);
                      if (payload.referenceType === 'ORDER') {
                        navigate(`/admin/orders/${payload.referenceId}`);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {payload.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {payload.message}
                        </p>
                        {payload.referenceType === 'ORDER' && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Order: <span className="font-semibold">{payload.referenceId}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-accent-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ), { duration: 5000 });

            } catch (err) {
              console.error('[WebSocket] Error parsing notification payload', err);
            }
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [user, playSound, navigate, markAsRead]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    hasMore,
  };
};
