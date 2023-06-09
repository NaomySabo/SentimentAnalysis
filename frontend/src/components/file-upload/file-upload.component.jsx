import React, { useRef, useState } from 'react'
import {
  FileUploadContainer,
  FormField,
  DragDropText,
  UploadFileBtn,
  FilePreviewContainer,
  ImagePreview,
  PreviewContainer,
  PreviewList,
  FileMetaData,
  RemoveFileIcon,
  InputLabel
} from './file-upload.styles'

const KILO_BYTES_PER_BYTE = 1000
const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 500000

const convertNestedObjectToArray = (nestedObj) =>
  Object.keys(nestedObj).map((key) => nestedObj[key])

const convertBytesToKB = (bytes) => Math.round(bytes / KILO_BYTES_PER_BYTE)

const FileUpload = ({
  label,
  updateFilesCb,
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  stateVar,
  changeState,
  ...otherProps
}) => {
  const fileInputField = useRef(null)
  const [files, setFiles] = useState({})

  const handleUploadBtnClick = () => {
    fileInputField.current.click()
  }

  const addNewFiles = (newFiles) => {
    for (const file of newFiles) {
      if (file.size <= maxFileSizeInBytes) {
        if (!otherProps.multiple) {
          return { file }
        }
        files[file.name] = file
      }
    }
    return { ...files }
  }

  const callUpdateFilesCb = (files) => {
    const filesAsArray = convertNestedObjectToArray(files)
    updateFilesCb(filesAsArray)
  }

  const handleNewFileUpload = (e) => {
    const { files: newFiles } = e.target
    if (newFiles.length) {
      const updatedFiles = addNewFiles(newFiles)
      setFiles(updatedFiles)
      callUpdateFilesCb(updatedFiles)
    }
  }

  const removeFile = (fileName) => {
    delete files[fileName]
    setFiles({ ...files })
    callUpdateFilesCb({ ...files })
    console.log('removed file', fileName)
  }

  return (
    <>
      <FileUploadContainer className={'background-blue'}
>
        <InputLabel>{label}</InputLabel>
        <DragDropText>Choose a file to analyze</DragDropText>
        <UploadFileBtn type="button" onClick={handleUploadBtnClick}>
          <i className="fas fa-file-upload" />
          <span> Upload {otherProps.multiple ? 'files' : 'a file'}</span>
        </UploadFileBtn>
        <FormField
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          {...otherProps}
        />
      </FileUploadContainer>
      <FilePreviewContainer>
        <PreviewList>
          {Object.keys(files).map((fileName, index) => {
            const file = files[fileName]
            const isImageFile = file.type.split('/')[0] === 'image'
            return (
              // ChangeFile({ ...stateVar, filename: fileName })
              <PreviewContainer key={fileName} onClick={() => { changeState({ ...stateVar, filename: fileName }); console.log('clicked ', fileName, stateVar) }}>
                <div>
                  {isImageFile && (
                    <ImagePreview
                      src={URL.createObjectURL(file)}
                      alt={`file preview ${index}`}
                    />
                  )}
                  <FileMetaData isImageFile={isImageFile}>
                    <span>{file.name}</span>
                    <aside>
                      <span>{convertBytesToKB(file.size)} kb</span>
                      <RemoveFileIcon
                        className="fas fa-trash-alt"
                        onClick={() => removeFile(fileName)}
                      />
                    </aside>
                  </FileMetaData>
                </div>
              </PreviewContainer>
            )
          })}
        </PreviewList>
      </FilePreviewContainer>
    </>
  )
}

export default FileUpload
