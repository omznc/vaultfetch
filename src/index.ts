const fs = require('fs');
const baseURL = process.env.VAULT_ADDR;
const token = process.env.VAULT_TOKEN;
const secretPath = process.env.SECRET_PATH;

if (!baseURL) throw new Error('VAULT_ADDR is not set');
if (!token) throw new Error('VAULT_TOKEN is not set');
if (!secretPath) throw new Error('SECRET_PATH is not set');

const vault = require("node-vault")({
	endpoint: baseURL,
	token: token,
	apiVersion: 'v1',
});


// I understand that I'm doing this in Typescript while using "any" everywhere, but I'm just trying to get this to work and this is my normal project template.
vault
	.read(secretPath)
	.then((result: any) => {
		if (!fs.existsSync('secrets')) fs.mkdirSync('secrets');
		if (result.data.data === undefined) throw new Error('Could not find any secrets.');
		fs.writeFileSync(
			`secrets/${ process.env.OUTPUT_FILE ?? ".env" }`,
			Object.keys(result.data.data).map(key => `${ key }=${ result.data.data[key] }`
			).join('\n'));

		console.log('Secret(s) fetched successfully.');
	})
	.catch((err: any) => {
		if (err.response === undefined)
			console.log(`Could not connect to the Vault server at ${ baseURL }.`);
		else
			switch (err.response.statusCode) {
				case 403:
					throw new Error('Access denied. Check your token and permissions.');
				case 404:
					throw new Error('Secret not found. Check your secret path.');
				case 500:
					throw new Error('Vault server error. Check your Vault server logs.');
				default:
					throw new Error(`Unknown error: ${ err.response.statusCode }`);
			}
	});
