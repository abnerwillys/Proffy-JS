document.querySelector("#add-time").addEventListener('click', cloneField)

function cloneField() {
  const newFieldContainer = document.querySelector('.schedule-item').cloneNode(true)
  const inputFields = newFieldContainer.querySelectorAll('input')

  inputFields.forEach((field) => {
    field.value = ""
  })

  document.querySelector('#schedule-items').appendChild(newFieldContainer)
}