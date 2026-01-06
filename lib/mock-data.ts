import type { DataRow } from "@/types/table"

const departments = ["Engineering", "Marketing", "Sales", "Support", "Product", "Design", "HR", "Finance"]
const statuses = ["Active", "Inactive"]
const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William"]
const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Anderson", "Thomas", "Jackson"]

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateDate(): string {
  const start = new Date(2020, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export const mockData: DataRow[] = Array.from({ length: 1000 }, (_, i) => {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)

  return {
    id: i + 1,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
    department: randomItem(departments),
    salary: Math.floor(Math.random() * 150000) + 50000,
    status: randomItem(statuses),
    joinDate: generateDate(),
  }
})
