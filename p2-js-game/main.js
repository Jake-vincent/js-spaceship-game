const buttonInstruction = document.getElementById('btn-instructions');

buttonInstruction.addEventListener('click', function(){
  let textInstruction = document.querySelector('ol');
  if(textInstruction.style.display === 'none') {
    textInstruction.style.display = 'block';
  } else {
    textInstruction.style.display = 'none'
  }
});