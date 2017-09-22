#!/usr/bin/node

const http = require('http')
const port = 8082

var buttonStates = {
  START_BUTTON: 0,
  Z_TRIG: 0,
  A_BUTTON: 0,
  B_BUTTON: 0,
  R_TRIG: 0,
  L_TRIG: 0,
  X_AXIS: 0,
  Y_AXIS: 0,
  R_DPAD: 0,
  L_DPAD: 0,
  U_DPAD: 0,
  D_DPAD: 0,
  R_CBUTTON: 0,
  L_CBUTTON: 0,
  U_CBUTTON: 0,
  D_CBUTTON: 0
}

var buttonProgression = [
  {
    button: 'A_BUTTON',
    duration: 100,
    wait: 5000
  },
    {
    button: 'A_BUTTON',
    duration: 200,
    wait: 4000
  },
  {
    button: 'A_BUTTON',
    duration: 300,
    wait: 3000
  },
  {
    button: 'A_BUTTON',
    duration: 400,
    wait: 2000
  },
  {
    button: 'A_BUTTON',
    duration: 500,
    wait: 1000
  }
]

var progressionCount = 0
var lastHrTime = [0, 0]
var currentDuration = [0, 0]
var currentWait = [0, 0]
var hrFirstRequest = [0, 0]
var hrstart = process.hrtime()
var firstRequest = true

const requestHandler = (request, response) => {
  if (firstRequest) {
    hrFirstRequest = process.hrtime(hrstart)
    lastHrTime = process.hrtime()
    process.stdout.write('hrFirstRequest = ' + hrFirstRequest[1]/1000000 + 'ms\n')
  }

  currentDuration = process.hrtime(lastHrTime)

  if (currentDuration[1]/1000000 >= buttonProgression[progressionCount].duration) {
    buttonStates[buttonProgression[progressionCount].button] = 0

    currentWait = process.hrtime(lastHrTime)

    if (currentWait[1]/1000000 >= buttonProgression[progressionCount].wait) {
      if (progressionCount >= buttonProgression.length) {
        progressionCount = 0
      } else {
        progressionCount += 1
      }
      
      lastHrTime = process.hrtime()
    }
  } else {
    if (buttonProgression[progressionCount].button.endsWith('AXIS')) {
      buttonStates[buttonProgression[progressionCount].button] = buttonProgression[progressionCount].value
    } else {
      buttonStates[buttonProgression[progressionCount].button] = 1
    }
  }

  process.stdout.clearLine()
  process.stdout.cursorTo(0)

  for (var buttonName in buttonStates) {
    if (buttonName != 'L_TRIG' && !buttonName.endsWith('DPAD') && buttonName != 'R_CBUTTON' && buttonName != 'U_CBUTTON' && buttonName != 'L_CBUTTON') {
      process.stdout.write(buttonName + ": " + buttonStates[buttonName] + ' ')
    }
  }

  process.stdout.write('pC = ' + progressionCount + ' ')
  process.stdout.write('cW = ' + currentWait[1]/1000000 + 'ms\t')
  process.stdout.write('cD = ' + currentDuration[1]/1000000 + 'ms')

  response.writeHead(200, {'Content-Type': 'text/plain'})
  response.end(JSON.stringify(buttonStates).split(',').join(', ').split(':').join(': '))

  if (firstRequest) {
    firstRequest = false
  }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return process.stdout.write('Failed to listen on port ' + port + '\n' + err)
  }

  process.stdout.write('Server is listening on port ' + port + '\n')
})
