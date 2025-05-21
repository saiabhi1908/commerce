import React, { useEffect, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useNavigate } from 'react-router-dom'

const VoiceAssistant = () => {
  const navigate = useNavigate()

  const [isListening, setIsListening] = useState(false) // Track if it's listening or not
  const [response, setResponse] = useState('') // For storing the chatbot response

  const commands = [
    {
      command: ['go to *', 'open *'],
      callback: (page) => {
        console.log('Navigate command received:', page) // Debugging log
        const formatted = page.toLowerCase()
        if (formatted.includes('profile')) navigate('/my-profile')
        else if (formatted.includes('appointments')) navigate('/my-appointments')
        else if (formatted.includes('contact')) navigate('/contact')
        else if (formatted.includes('about')) navigate('/about')
        else if (formatted.includes('home')) navigate('/')
        else if (formatted.includes('doctors')) navigate('/doctors')
        else if (formatted.includes('login')) navigate('/login')
        else if (formatted.includes('verify')) navigate('/verify')
        else setResponse(`Sorry, I don't recognize "${page}"`)
      }
    },
    {
      command: ['what is your name?', 'who are you?', 'what can you do?', 'Tell me about yourself', 'yo'],
      callback: () => {
        setResponse('I am your virtual assistant! I can help you navigate the website and answer some basic questions.')
      }
    },
    {
      command: ['Hi, how are you?','Hi, how are you doing?', 'how are you?', 'how are you doing?', 'how is it going?', 'hi'],
      callback: () => {
        setResponse('I am just a program, but I am doing great! How about you?')
      }
    },
    {
      command: ['what is the time?', 'what time is it?', 'tell me the time'],
      callback: () => {
        const currentTime = new Date().toLocaleTimeString()
        setResponse(`The current time is ${currentTime}`)
      }
    },
    {
      command: ['what is the time?', 'what time is it?', 'tell me the time'],
      callback: () => {
        const currentTime = new Date().toLocaleTimeString()
        setResponse(`The current time is ${currentTime}`)
      }
    },
    {
      command: ['Hello', 'hi', 'hey'],
      callback: () => {
        setResponse('Hello! How can I assist you today?')
      }
    },
    {
        command: ['How old are you?'],
        callback: () => {
          setResponse('I dont have a specific age like you')
        }
      },
    {
      command: ['goodbye', 'bye', 'see you', 'bye for now'],
      callback: () => {
        setResponse('Goodbye! Have a nice day!')
        setIsListening(false) // Stop listening when saying goodbye
      }
    },
    // Appointment-related queries
    {
      command: ['How to make an appointment', 'how to book an appointment?', 'how can I book an appointment?', 'how do I book an appointment?', 'what is the process for booking an appointment?'],
      callback: () => {
        setResponse('To book an appointment, you can go to the "Doctors" section, choose a doctor, and select an available time slot.')
      }
    },
    {
      command: ['what are the available appointment slots?', 'when can I book an appointment?', 'what time is available for appointments?'],
      callback: () => {
        setResponse('Please check the "Doctors" section for available slots based on the doctor you want to see.')
      }
    },
    {
      command: ['can I book an appointment with a doctor?', 'can I make an appointment?', 'how can I schedule an appointment?'],
      callback: () => {
        setResponse('Yes, you can schedule an appointment by visiting the "Doctors" section and selecting your preferred doctor.')
      }
    }
  ]

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript
  } = useSpeechRecognition({ commands })

  useEffect(() => {
    if (isListening) {
      SpeechRecognition.startListening({ continuous: true })
    } else {
      SpeechRecognition.stopListening()
    }
  }, [isListening]) // This effect runs when isListening state changes

  // Debugging log
  useEffect(() => {
    if (transcript) {
      console.log('Transcript:', transcript) // Log the current transcript
    }
  }, [transcript])

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#f1f1f1',
        padding: '12px 20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.15)',
        fontSize: '14px',
        zIndex: 1000
      }}
    >
      <strong>Voice Assistant:</strong>
      <p style={{ margin: '5px 0' }}>
        {listening ? 'Listening...' : 'Click mic to speak'}
      </p>
      <p style={{ color: '#333' }}><em>{transcript}</em></p>
      <p><strong>Response:</strong> {response}</p>

      {/* Button to toggle listening */}
      <button 
        onClick={() => setIsListening(prev => !prev)}
        style={{
          padding: '8px 15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  )
}

export default VoiceAssistant
