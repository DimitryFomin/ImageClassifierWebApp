let net;
const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();
const classes = ['A', 'B', 'C', 'No-Action'];
var canvas, ctx;



async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();


function loadDiv(div) {
  var mydiv = document.createElement('div');
  mydiv.className = "col-sm-12";
  var canvas = document.createElement('canvas');
  canvas.width  = 75;
  canvas.height = 56;
  mydiv.appendChild(canvas)
  ctx = canvas.getContext('2d');
  ctx.drawImage(webcamElement, 0,0, canvas.width, canvas.height);
  div.appendChild(mydiv)

  canvas.getContext('2d');
}
  const addSnapshot = classId => {
    console.log("class"+classes[classId]);
    var classDIVid = document.getElementById("class"+classes[classId]);
    //add snapshot
    loadDiv(classDIVid);
    
    
  };
  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
    addSnapshot(classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-na').addEventListener('click', () => addExample(3)); //No action
  
  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);
      document.getElementById('prediction').innerText = `${classes[result.classIndex]}`;
      document.getElementById('probability').innerText = `${result.confidences[result.classIndex]}`;
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;
      navigator.getUserMedia = navigator.getUserMedia ||
          navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
          navigatorAny.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true},
          stream => {
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('loadeddata',  () => resolve(), false);
          },
          error => reject());
      } else {
        reject();
      }
    });
  }

app();