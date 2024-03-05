# Lambda Zip Extractor for S3

## 下載專案

```bash
git clone https://github.com/ycs77/lambda-extractor-for-s3.git
cd lambda-extractor-for-s3
```

## 編譯 Function

首先複製 `.env` 檔案並設定環境變數，只需要設定 `LAMBDA_EXTRACT_DIR` 即可。

```bash
cp .env.example .env
```

然後執行腳本進行編譯：

```bash
yarn
sh ./build.sh
```

開啟 Lambda Function 的「程式碼」頁籤右上角點「上傳於」>「.zip 檔案」，選擇 `dist/lambda-extractor-for-s3.zip` 即可。

開啟 Lambda Function 的「組態」>「一般組態」>「編輯」，根據平均執行時間長度調整「逾時」時間。

## 本地開發

在 `.env` 檔案中增加 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_REGION`。

然後複製 `dev.mjs` 檔案並貼上測試 event 內容：

```bash
cp dev-example.mjs dev.mjs
```

## Credit

* [Multiple file upload into Amazon s3 bucket](https://princekfrancis.medium.com/multiple-file-upload-into-amazon-s3-bucket-9888d51001bb)
* [Lambda Zip Extractor](https://github.com/akbng/lambda-zip-extractor)

## License

[LICENSE](./LICENSE)
