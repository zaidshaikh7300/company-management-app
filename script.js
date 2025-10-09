const backend = 'http://localhost:3000/api'
let current = 'management'

const buttons = {
  management: document.getElementById('management'),
  manager: document.getElementById('manager'),
  employee: document.getElementById('employee')
}

const list = document.getElementById('list')
const addBtn = document.getElementById('addBtn')
const updateBtn = document.getElementById('updateBtn')
const form = document.getElementById('dataForm')
const formTitle = document.getElementById('formTitle')
const formFields = document.getElementById('formFields')
const cancelBtn = document.getElementById('cancelBtn')

Object.keys(buttons).forEach(k => buttons[k].addEventListener('click', () => loadTab(k)))
addBtn.addEventListener('click', showAddForm)
updateBtn.addEventListener('click', showUpdateForm)
cancelBtn.addEventListener('click', () => form.classList.add('hidden'))
form.addEventListener('submit', handleSubmit)

async function loadTab(tab) {
  current = tab
  list.innerHTML = '<li>Loading...</li>'
  form.classList.add('hidden')

  const res = await fetch(`${backend}/${tab}s`)
  const data = await res.json()
  list.innerHTML = ''
  data.forEach(item => {
    let text = ''
    if(tab === 'management') text = `${item.id}. ${item.name}`
    if(tab === 'manager') text = `${item.id}. ${item.name} (${item.email}) [Mgmt: ${item.managementId}]`
    if(tab === 'employee') text = `${item.id}. ${item.name} (${item.email}) - ${item.position} [Mgr: ${item.managerId}]`
    const li = document.createElement('li')
    li.textContent = text
    list.appendChild(li)
  })
}

function showAddForm() {
  formTitle.textContent = `Add ${capitalize(current)}`
  formFields.innerHTML = getFormFields(current)
  form.dataset.mode = 'add'
  form.classList.remove('hidden')
}

function showUpdateForm() {
  const id = prompt('Enter ID to update:')
  if(!id) return
  formTitle.textContent = `Update ${capitalize(current)} (ID: ${id})`
  form.dataset.mode = 'update'
  form.dataset.id = id
  formFields.innerHTML = getFormFields(current)
  form.classList.remove('hidden')
}

function getFormFields(type) {
  if(type === 'management') return `<input name="name" placeholder="Management Name" required>`
  if(type === 'manager') return `
    <input name="name" placeholder="Manager Name" required>
    <input name="email" placeholder="Email" required>
    <input name="managementId" placeholder="Management ID" required>`
  if(type === 'employee') return `
    <input name="name" placeholder="Employee Name" required>
    <input name="email" placeholder="Email" required>
    <input name="position" placeholder="Position" required>
    <input name="managerId" placeholder="Manager ID" required>`
}

async function handleSubmit(e) {
  e.preventDefault()
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())

  const url = `${backend}/${current}s${form.dataset.mode === 'update' ? '/' + form.dataset.id : ''}`
  const method = form.dataset.mode === 'update' ? 'PUT' : 'POST'

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formatData(current, data))
  })

  form.classList.add('hidden')
  loadTab(current)
}

function formatData(type, d) {
  if(type === 'management') return { name: d.name }
  if(type === 'manager') return { name: d.name, email: d.email, managementId: Number(d.managementId) }
  if(type === 'employee') return { name: d.name, email: d.email, position: d.position, managerId: Number(d.managerId) }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// Default tab
loadTab('management')