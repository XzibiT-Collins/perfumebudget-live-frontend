const fs = require('fs');
const data = JSON.parse(fs.readFileSync('api-schema.json'));

const paths = Object.keys(data.paths).filter(p => p.includes('family') || p.includes('convers') || p.includes('product'));
console.log('--- PATHS ---');
paths.forEach(p => console.log(p));

console.log('\n--- SCHEMAS ---');
const schemas = Object.keys(data.components.schemas).filter(s => 
    s.includes('Family') || 
    s.includes('Convers') || 
    s.includes('Uom') || 
    s.includes('ProductCreation') || 
    s.includes('Variant')
);
schemas.forEach(s => {
    console.log(`\nSchema: ${s}`);
    console.log(JSON.stringify(data.components.schemas[s], null, 2));
});
