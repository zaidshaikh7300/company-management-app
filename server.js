const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
// -----------------Management--------------
app.get('/api/managements', async (_, res) => res.json(await prisma.management.findMany()))

app.get('/api/managements/:id', async (req, res) => {
  const id = Number(req.params.id)
  res.json(await prisma.management.findUnique({ where: { id } }))
})

app.get("/management/managers/:id", async (req, res) => {
  const id = Number(req.params.id);
  const management = await prisma.management.findUnique({
    where: { id },
    include: { managers: true },
  });
  res.json(management);
});

app.post('/api/managements', async (req, res) => res.json(await prisma.management.create({ data: req.body })))

app.put('/api/managements/:id', async (req, res) => {
  const id = Number(req.params.id)
  res.json(await prisma.management.update({ where: { id }, data: req.body }))
})

app.get("/management/:mId/manager/:mgrId", async (req, res) => {
  try {
    const managementId = parseInt(req.params.mId);
    const managerId = parseInt(req.params.mgrId);

    // Step 1: Management ke andar se ek manager dhundhna
    const management = await prisma.management.findUnique({
      where: { id: managementId },
      include: {
        managers: {
          where: { id: managerId },
          include: {
            employees: true, // 👈 is manager ke employees bhi aayenge
          },
        },
      },
    });

    // Step 2: Agar management nahi mila
    if (!management) {
      return res.status(404).json({ message: "Management not found" });
    }

    // Step 3: Agar manager nahi mila
    if (management.managers.length === 0) {
      return res.status(404).json({ message: "Manager not found under this management" });
    }

    res.json(management);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



// -----------------Manager-------------------
app.get('/api/managers', async (_, res) => res.json(
  await prisma.manager.findMany()))

app.post('/api/managers', async (req, res) => res.json(
  await prisma.manager.create({ data: req.body })))

app.put('/api/managers/:id', async (req, res) => {
  const id = Number(req.params.id)
  res.json(await prisma.manager.update({ where: { id }, data: req.body }))
})

app.get("/manager/employees", async (req, res) => {
  const employees = await prisma.manager.findMany({include:{employees:true}});
  res.json(employees);
});



app.get("/manager/employees/:id", async (req, res) => {
  const id = Number(req.params.id);
  const employees = await prisma.manager.findUnique({
    where: { id },
    include: { employees: true },
  });
  res.json(employees);
});



// ----------------------Employee-----------------------
app.get('/api/employees', async (_, res) => res.json(await prisma.employee.findMany()))
app.post('/api/employees', async (req, res) => res.json(await prisma.employee.create({ data: req.body })))
app.put('/api/employees/:id', async (req, res) => {
  const id = Number(req.params.id)
  res.json(await prisma.employee.update({ where: { id }, data: req.body }))
})

// ----- Start Server -----
const PORT = 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))