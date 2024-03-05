npx tsup-node

yarn --force --production
cp -r node_modules dist

cd dist
7z a -tzip lambda-extractor-for-s3.zip index.mjs node_modules

rm -rf index.mjs node_modules
# rm -rf node_modules

cd ..

yarn --force
