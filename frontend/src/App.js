import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import FileUpload from './components/file-upload/file-upload.component'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import './App.css'

function App () {
  const [newUserInfo, setNewUserInfo] = useState({
    profileImages: []
  })

  const [display, displayStats] = useState({
    show: false
  })

  const [file, ChangeFile] = useState({
    filename: ''
  })

  const [sentiment, setSentiment] = useState({
    average_sentiment: '',
    median_sentiment: '',
    most_negative: [],
    most_positive: []
  })

  const updateUploadedFiles = (files) =>
    setNewUserInfo({ ...newUserInfo, profileImages: files })

  const handleSubmit = (event) => {
    event.preventDefault()
    // logic to create new user...
  }

  const toggleButtonState = () => {
    console.log(file)

    fetch('//0.0.0.0:5000/api/find_sentiment', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ContentType: 'application/json'
      },
      body: JSON.stringify({
        filename: file.filename
      })
    }).then(response => {
      if (response.ok) {
        response.json().then(json => {
          console.log(json)
          setSentiment({
            ...sentiment,
            average_sentiment: json.average_sentiment,
            median_sentiment: json.median_sentiment,
            most_positive: json.most_positive,
            most_negative: json.most_negative
          })
          console.log(sentiment)
        })
        displayStats({ ...display, show: true })
      }
    })
  }

  return (
    <div className={'background'}>
      <form onSubmit={handleSubmit}>
        <div>
        <FileUpload
          accept=".txt"
          label="Sentiment Analyzer"
          multiple
          updateFilesCb={updateUploadedFiles}
          stateVar={file}
          changeState={ChangeFile}
        />
        </div>

      </form>
    <div className='center'>
        <Button variant="primary" id={'main-button'} onClick={toggleButtonState} >ANALYZE</Button>
    </div>
    <div className={display.show ? 'center' : 'hidden'}>
      <Card style={{ width: '30rem', marginTop: '3rem' }} >
      <ListGroup variant="flush">
        <ListGroup.Item className={'blue'}>Average Sentiment: { sentiment.average_sentiment} </ListGroup.Item>
        <ListGroup.Item className={'blue'}>Median Sentiment: {sentiment.median_sentiment}</ListGroup.Item>
        <ListGroup.Item className={'blue'}>Most Positive Reviews:</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>1. &quot;{ sentiment.most_positive[2]}&quot;</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>2. &quot;{ sentiment.most_positive[1]}&quot;</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>3. &quot;{ sentiment.most_positive[0]}&quot;</ListGroup.Item>
        <ListGroup.Item className={'blue'}>Most Negative Reviews:</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>1. &quot;{ sentiment.most_negative[0]}&quot;</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>2. &quot;{ sentiment.most_negative[1]}&quot;</ListGroup.Item>
        <ListGroup.Item className={'lightblue'}>3. &quot;{ sentiment.most_negative[2]}&quot;</ListGroup.Item>
      </ListGroup>

    </Card>
    </div>
    </div>
  )
}

export default App
