package main

import (
	"context"
	"fmt"
	vault "github.com/hashicorp/vault/api"
	"os"
)

func main() {

	config := vault.DefaultConfig()
	token, address, path, KV2mount, fileName := getParameters()

	client, err := vault.NewClient(config)
	if err != nil {
		panic(err)
	}

	client.SetToken(token)
	err = client.SetAddress(address)
	if err != nil {
		panic(err)
	}
	fmt.Println("Fetching secrets from Vault...")
	backupOldSecrets(fileName)
	saveToFile(fileName, fetchSecrets(client, KV2mount, path))

}

func backupOldSecrets(name string) {
	if _, err := os.Stat("backup"); os.IsNotExist(err) {
		os.Mkdir("backup", 0755)
	}

	if _, err := os.Stat(fmt.Sprintf("output/%s", name)); !os.IsNotExist(err) {
		fmt.Println("Backed up old secrets.")
		os.Rename(fmt.Sprintf("output/%s", name), fmt.Sprintf("backup/%s", name))
	}

}

func fetchSecrets(client *vault.Client, KV2mount string, path string) *vault.KVSecret {
	secret, err := client.KVv2(KV2mount).Get(context.Background(), path)
	if err != nil {
		panic(err)
	}
	return secret
}

func saveToFile(fileName string, secrets *vault.KVSecret) {
	if _, err := os.Stat("output"); os.IsNotExist(err) {
		os.Mkdir("output", 0755)
	}

	file, err := os.Create(fmt.Sprintf("output/%s", fileName))
	if err != nil {
		panic(err)
	}

	i := 0
	for key, value := range secrets.Data {
		i += 1
		_, err := file.WriteString(fmt.Sprintf("%s=%s\n", key, value))
		if err != nil {
			panic(err)
		}
	}

	fmt.Println("Wrote", i, "secrets.")
	if err := file.Close(); err != nil {
		panic(err)
	}
}

func getParameters() (string, string, string, string, string) {
	token := os.Getenv("VAULT_TOKEN")
	address := os.Getenv("VAULT_ADDR")
	path := os.Getenv("VAULT_SECRET_PATH")
	KV2mount := os.Getenv("VAULT_KV2_MOUNT")
	fileName := os.Getenv("OUTPUT_FILE")

	if fileName == "" {
		fileName = ".env"
	}

	if KV2mount == "" {
		KV2mount = "secret"
	}

	if token == "" || address == "" {
		panic("Incorrect token or address")
	}
	return token, address, path, KV2mount, fileName
}
