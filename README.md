<center><img src="https://i.imgur.com/WGqYaLo.png"/></center>

<a href="https://hub.docker.com/repository/docker/omznc/vaultfetch"><img src="https://img.shields.io/badge/DockerHub-white?style=for-the-badge&logo=docker"></a></p>

This exists to solve a simple problem I had - simply fetching multiple secrets on the same path, and saving them to a
file. It's written in Go, and is a single, snappy binary.

It's supposed to be used in smaller-scale projects, where you don't want to use a full-blown secret management system,
but you still want to utilize Vault.

## Use-case

- I have a number of secrets in Vault, all under the same path.
- I want to fetch them all, and save them to a file.
- I have a Docker compose file that uses the env file to set environment variables for the containers.

### Example

This will mount the current directory to the output of the .env file, and fetch the secrets from the
path `secret/staging` with obviously fake credentials.
```bash
docker run -it --rm -v $(pwd):/app/output -e VAULT_ADDR=https://vault.example.com -e VAULT_TOKEN=1234567890 -e VAULT_SECRET_PATH=project/staging omznc/vaultfetch
```

## Volume mapping

- `/app/output` - The output file. This is where the .env file will be saved.
- `/app/backup` - The backup directory. This is where the previous .env file will be saved.
## Environment Variables

- `VAULT_ADDR` - The address of the Vault server.
- `VAULT_TOKEN` - The token to use to authenticate with Vault.
- `VAULT_SECRET_PATH` - The path to fetch secrets from. You don't need to include the mount path because of the `VAULT_KV2_MOUNT` variable.
- `VAULT_KV2_MOUNT` - The mount point of the KV2 secrets engine. Defaults to `secret`.
- `OUTPUT_FILE` - The file to write the output to. Defaults to `.env`.


## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html), so you
can do a lot of things with it, as long as your code is open-source as well. Would be cool of you to link back to this
project, but it's not required.

## Contributing

If you have any ideas, or want to contribute, feel free to open an issue or a pull request.
I don't have any specific guidelines, but I'll try to respond as soon as I can.

---
[![CI](https://github.com/omznc/vaultfetch/actions/workflows/CI.yml/badge.svg)](https://github.com/omznc/vaultfetch/actions/workflows/CI.yml)
