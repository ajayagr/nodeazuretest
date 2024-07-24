const express = require("express");
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Azure Blob Storage connection string
const AZURE_STORAGE_CONNECTION_STRING =
  "AZ_CONNECTION_STRING";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

app.get("/get-json/:containerName/:blobName", async (req, res) => {
  const { containerName, blobName } = req.params;

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download(0);
    const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

    res.json(JSON.parse(downloaded.toString()));
  } catch (error) {
    console.error("Error downloading blob:", error.message);
    res.status(500).send("Error downloading blob");
  }
});

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
