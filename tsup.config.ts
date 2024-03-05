import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsup'
import dotenv from 'dotenv'
import { replace as EsbuildReplace } from 'esbuild-plugin-replace'

function replaceEnvVars(envFilename: string) {
  const fullEnvFilename = path.resolve(__dirname, envFilename)

  if (!fs.existsSync(fullEnvFilename)) {
    throw new Error(`Missing ${envFilename}`)
  }

  const envContent = fs.readFileSync(fullEnvFilename, { encoding: 'utf-8' })
  const config = dotenv.parse(envContent)
  const output = {}

  for (const key of Object.keys(config)) {
    output[`process.env.${key}`] = JSON.stringify(config[key])
  }

  return output
}

export default defineConfig({
  entry: ['index.mjs'],
  format: ['esm'],
  clean: true,
  external: ['@aws-sdk/client-s3', '@aws-sdk/lib-storage'],
  esbuildPlugins: [
    EsbuildReplace(replaceEnvVars('.env')),
  ],
})
