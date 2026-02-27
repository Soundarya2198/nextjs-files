"use client";

import { useState, useEffect, useRef } from "react"
import styles from "./dashboard.module.css"

type FileItem = {
    id: number,
    name: string,
    size: string,
    status: "Uploading" | "Processing" | "Done";
}

export default function Dashboard() {

    const [files, setFiles] = useState<FileItem[]>([])
    const token = localStorage.getItem("token")
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      fetchFiles()
    }, [])

const fetchFiles = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  const data = await res.json()
  setFiles(data.data)
}
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try{
        const file = e.target.files?.[0]
        if(!file){
            return;
        }

        const token = localStorage.getItem("token")

        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/getPresignedUrl`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Authorization : `Bearer ${token}`,
            },
            body: JSON.stringify({
                filename: file.name
            })
        })

        const {uploadUrl, fileKey} = await result.json()

        // storig s3 file
        await fetch(uploadUrl, {
            method: "Put",
            body: file
        })

       // save meta data 

       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
             Authorization:  `Bearer ${token}`
         },
        body: JSON.stringify({
            name: file.name,
            key: fileKey,
            size: file.size
        })
       })
       alert("Upload Sucessfull")
       fetchFiles()
    }catch(e){
        console.log(e)
    }
}

// const handlePreview = (fileId: number) => {
   
// }

const handleDelete = async (fileId : number) => {

  const confirmDelete = confirm("Are you sure you want to delete")
  if(!confirmDelete){
    return;
  }

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json"
    }

  })

  alert("File Deleted Sucessfully")
  fetchFiles()
}

const handleDownload = async (fileId: number) => {
  try{
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}/getFilePreSignedUrl`, {
      method: "GET",
      headers: {
        Authorization : `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })

    const {downloadUrl} = await result.json()

    window.open(downloadUrl, "_blank")
  }
  catch(e){
    console.error("Download failed", e)
  }
}
  
   return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <h2>MyDrive</h2>
        <div className={styles.nav}>
          <button className={styles.search}>Search</button>
          <button className={styles.search}>Profile</button>
        </div>
      </header>

      {/* Upload button */}

      <input type ="file" ref={fileInputRef} style={{display:"none"}} onChange={handleFileChange} />
      <div className={styles.uploadSection}>
        <button onClick={() => fileInputRef.current?.click()} className={styles.uploadBtn}>
          + Upload File
        </button>
      </div>

      {/* Table */}
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name</span>
          <span>Size</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {files.map((file) => (
          <div key={file.id} className={styles.row}>
            <span>{file.name}</span>
            <span>{file.size}</span>
            <span className={styles[file.status.toLowerCase()]}>
              {file.status}
            </span>

            <div className={styles.actions}>
              <button onClick={() => handleDownload(file.id)}>Preview</button>
              {file.status === "Done" && <button onClick={() => handleDownload(file.id)}>Download</button>}
              <button onClick={() => handleDelete(file.id)} className={styles.delete}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
