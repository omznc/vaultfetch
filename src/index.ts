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

		fs.writeFileSync(`secrets/${ process.env.OUTPUT_FILE ??
		".env" }`, Object.keys(result.data.data).map(key => `${ key }=${ result.data.data[key] }`).join('\n'));

		console.log('Secrets written to successfully.');
	})
	.catch((err: any) => {
		if (err.response === undefined) console.log(`Could not connect to the Vault server at ${ baseURL }.`);

		else switch (err.response.statusCode) {
			case 403:
				console.log('Access denied. Check your token and permissions.');
				break;
			case 404:
				console.log('Secret not found. Check your secret path.');
				break;
			case 500:
				console.log('Vault server error. Check your Vault server logs.');
				break;
			default:
				console.log(`Unknown error: ${ err.response.statusCode }`);
		}
	});
