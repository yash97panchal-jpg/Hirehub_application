import React, { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, TrendingUp, Info, Building2, Briefcase } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"

const expData = [
  { name: "0-1 yrs", salary: 75000 },
  { name: "1-3 yrs", salary: 95000 },
  { name: "3-5 yrs", salary: 135000 },
  { name: "5-8 yrs", salary: 165000 },
  { name: "8+ yrs", salary: 195000 },
]

const topCompanies = [
  { name: "TechCorp Solutions", salary: "$160k", role: "Senior Engineer", logo: "T" },
  { name: "FinanceFlow Inc", salary: "$145k", role: "Full Stack Dev", logo: "F" },
  { name: "GreenTech Ventures", salary: "$130k", role: "Data Scientist", logo: "G" },
  { name: "DesignHub Agency", salary: "$110k", role: "UX/UI Designer", logo: "D" },
]

const relatedRoles = [
  { title: "Frontend Developer", avg: "$115k" },
  { title: "Backend Developer", avg: "$125k" },
  { title: "Full Stack Developer", avg: "$135k" },
  { title: "DevOps Engineer", avg: "$145k" },
  { title: "Software Architect", avg: "$180k" },
]

export default function SalaryInsights() {
  const [role, setRole] = useState("Software Engineer")
  const [location, setLocation] = useState("San Francisco, CA")
  const [searchedRole, setSearchedRole] = useState("Software Engineer")
  const [searchedLocation, setSearchedLocation] = useState("San Francisco, CA")

  const handleSearch = () => {
    setSearchedRole(role || "Software Engineer")
    setSearchedLocation(location || "United States")
  }

  // Calculate some fake dynamic values based on the search length just to make it feel alive
  const multiplier = 1 + (searchedRole.length % 5) * 0.05
  const baseSalary = 135000 * multiplier
  const minSalary = baseSalary * 0.7
  const maxSalary = baseSalary * 1.4

  const dynamicExpData = expData.map(d => ({
    ...d,
    salary: Math.floor(d.salary * multiplier)
  }))

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-20">
      {/* Header & Search */}
      <div
        className="py-12"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--primary-deep) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-poppins text-3xl md:text-5xl font-bold text-white mb-4">
              Real-Time Salary Insights
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Make informed career decisions with accurate compensation data based on thousands of recent job postings.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card)] rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-xl max-w-4xl mx-auto border border-[var(--border)]"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 text-[var(--muted-foreground)]" size={18} />
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Job Title (e.g. Software Engineer)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
            </div>
            <div className="relative flex-1 flex items-center">
              <MapPin className="absolute left-4 text-[var(--muted-foreground)]" size={18} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. San Francisco, CA)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
            </div>
            <Button variant="primary" onClick={handleSearch} className="py-3 px-8 text-sm shrink-0 rounded-xl">
              Find Salaries
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--card)] rounded-3xl p-6 md:p-8 border border-[var(--border)] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6 text-[var(--muted-foreground)]">
                <Briefcase size={18} />
                <span className="font-medium text-sm">Average base salary for</span>
                <span className="font-bold text-[var(--foreground)]">{searchedRole}</span>
                <span className="text-sm">in</span>
                <span className="font-bold text-[var(--foreground)]">{searchedLocation}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
                <div>
                  <h2 className="text-5xl font-poppins font-bold text-[var(--foreground)] tracking-tight">
                    {formatCurrency(baseSalary)}
                  </h2>
                  <p className="text-[var(--muted-foreground)] mt-2 font-medium">/ yr base pay</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--success)] bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                  <TrendingUp size={16} />
                  <span className="font-semibold">+4.2% from last year</span>
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-semibold text-[var(--muted-foreground)]">
                  <span>Low: {formatCurrency(minSalary)}</span>
                  <span>Average: {formatCurrency(baseSalary)}</span>
                  <span>High: {formatCurrency(maxSalary)}</span>
                </div>
                <div className="relative h-4 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] opacity-20" />
                  <div 
                    className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-full transition-all duration-1000 ease-out" 
                    style={{ left: '15%', width: '70%' }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-sm z-10 -ml-0.5 transition-all duration-1000 ease-out" 
                    style={{ left: '50%' }}
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 justify-center mt-2">
                  <Info size={12} /> Based on 1,245 reported salaries in the past 12 months
                </p>
              </div>
            </motion.div>

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--card)] rounded-3xl p-6 md:p-8 border border-[var(--border)] shadow-sm"
            >
              <h3 className="font-poppins text-xl font-bold text-[var(--foreground)] mb-6">
                Salary by Experience Level
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicExpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-card)',
                        color: 'var(--foreground)'
                      }}
                      formatter={(value: any) => [formatCurrency(Number(value) || 0), "Average Salary"]}
                    />
                    <Bar dataKey="salary" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {dynamicExpData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--primary)' : 'var(--muted-foreground)'} opacity={index === 2 ? 1 : 0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Top Companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm"
            >
              <h3 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-5 flex items-center gap-2">
                <Building2 size={18} className="text-[var(--primary)]" />
                Top Paying Companies
              </h3>
              <div className="space-y-4">
                {topCompanies.map((company, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {company.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] truncate">{company.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{company.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-[var(--primary)]">{company.salary}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Avg Base</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 text-sm">
                View all companies
              </Button>
            </motion.div>

            {/* Related Roles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm"
            >
              <h3 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-5">
                Related Roles
              </h3>
              <div className="space-y-3">
                {relatedRoles.map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer group border border-transparent hover:border-[var(--border)]">
                    <p className="font-medium text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {role.title}
                    </p>
                    <span className="font-semibold text-sm text-[var(--muted-foreground)]">
                      {role.avg}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
