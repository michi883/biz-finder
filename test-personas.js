// const fetch = require('node-fetch'); // Built-in in Node 20

async function testPersonas() {
    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: 'Would a high speed coffee shop work in Williamsburg?'
            })
        });

        const data = await response.json();
        console.log('\n=== RESPONSE DATA ===');
        console.log(JSON.stringify(data, null, 2));

        if (data.personas) {
            console.log('\n✅ Personas found!');
            console.log('Count:', data.personas.length);
        } else {
            console.log('\n❌ No personas in response');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testPersonas();
