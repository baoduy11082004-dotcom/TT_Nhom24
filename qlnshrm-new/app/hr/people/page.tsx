"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Users, Grid3X3, List, Filter, Mail, Clock, Moon, ChevronDown, Plus, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"

// 1. ĐỊNH NGHĨA INTERFACE
interface User {
  id: string
  name: string
  email: string
  image_url?: string
  role?: string
  team_id?: string
  is_hr?: number
  work_start?: string
  work_end?: string
  status?: string
}

type ViewMode = "list" | "grid" | "teams"

export default function PeoplePage() {
  const router = useRouter()
  
  // State quản lý dữ liệu
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [openAddDialog, setOpenAddDialog] = useState(false)

  // 2. HÀM GỌI API (Lấy danh sách nhân viên)
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching users from Database...")
      
      const res = await fetch(`http://localhost:5000/api/user/users?_t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (res.ok) {
        const data = await res.json()
        const userList = Array.isArray(data) ? data : (data.users || [])
        setUsers(userList)
      } else {
        const errText = await res.text();
        throw new Error(`Server Error: ${res.status} - ${errText}`)
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách nhân viên:", err)
      setError("Không thể kết nối đến Database. Vui lòng kiểm tra lại Server Backend.")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Gọi API khi mới vào trang
  useEffect(() => {
    fetchUsers()
  }, [])

  // 3. LOGIC HIỂN THỊ
  const getTeamName = (teamId: string = "") => {
    if (!teamId) return "Chưa phân nhóm";
    const map: Record<string, string> = {
      'hr': 'Human Resources',
      'dev': 'Engineering',
      'design': 'Design',
      'qa': 'Quality Assurance',
      'marketing': 'Marketing',
      'product': 'Product Management'
    }
    return map[teamId.toLowerCase()] || teamId.toUpperCase()
  }

  const uniqueTeams = Array.from(new Set(users.map(u => u.team_id || "unknown"))).filter(t => t !== "unknown")

  const getTeamColor = (teamId: string = "") => {
    const t = teamId.toLowerCase()
    if (t.includes('design')) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
    if (t.includes('dev')) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    if (t.includes('hr')) return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
    if (t.includes('qa')) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    if (t.includes('mkt') || t.includes('marketing')) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  // 4. LỌC DỮ LIỆU
  const filteredPeople = users.filter((person) => {
    const personTeam = person.team_id || "unknown"
    const matchesSearch =
      (person.name && person.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (person.email && person.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTeam = selectedTeam === "all" || personTeam === selectedTeam
    return matchesSearch && matchesTeam
  })

  // 5. NHÓM THEO TEAM
  const peopleByTeams = uniqueTeams.reduce(
    (acc, teamId) => {
      acc[teamId] = filteredPeople.filter((person) => (person.team_id || "unknown") === teamId)
      return acc
    },
    {} as Record<string, User[]>,
  )

  const PersonCard = ({ person, compact = false }: { person: User; compact?: boolean }) => {
    const teamId = person.team_id || "unknown"
    const teamDisplayName = getTeamName(teamId)
    const isOnline = person.status === 'online' 

    return (
      <Card
        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
        onClick={() => router.push(`/hr/people/${person.id}`)}
      >
        <CardContent className={`${compact ? "p-4" : "p-6"}`}>
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className={`${compact ? "w-10 h-10" : "w-12 h-12"}`}>
                <AvatarImage src={person.image_url || "/placeholder.svg"} className="object-cover" />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {person.name ? person.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              
              {!isOnline && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <Moon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h3 className={`${compact ? "text-sm" : "text-base"} font-semibold text-gray-900 dark:text-white truncate`}>
                    {person.name}
                    </h3>
                    {person.role && <span className="text-xs text-gray-500">{person.role}</span>}
                </div>
                {teamId !== "unknown" && <Badge className={`${getTeamColor(teamId)} text-xs border-none`}>{teamDisplayName}</Badge>}
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Mail className="w-3 h-3 mr-1" />
                  <span className="truncate">{person.email}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{person.work_start || "00:00"} - {person.work_end || "00:00"}</span>
                  {isOnline ? (
                    <span className="ml-2 text-green-600 dark:text-green-400 font-medium">• Online</span>
                  ) : (
                    <span className="ml-2 text-gray-400 dark:text-gray-500">• Offline</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ListView = () => (
    <div className="space-y-4">
      {filteredPeople.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  )

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPeople.map((person) => (
        <PersonCard key={person.id} person={person} compact />
      ))}
    </div>
  )

  const TeamsView = () => (
    <div className="space-y-6">
      {uniqueTeams.map((teamId) => {
        const teamPeople = peopleByTeams[teamId] || []
        if (teamPeople.length === 0) return null
        const teamDisplayName = getTeamName(teamId)

        return (
          <div key={teamId}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{teamDisplayName}</h3>
                <Badge className={getTeamColor(teamId)}>
                  {teamPeople.length} member{teamPeople.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamPeople.map((person) => (
                <PersonCard key={person.id} person={person} compact />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // --- HÀM XỬ LÝ THÊM NHÂN VIÊN MỚI (UPDATE) ---
  const handleAddEmployee = async (data: any) => {
    try {
      // Gọi API Backend để lưu nhân viên mới
      const res = await fetch('http://localhost:5000/api/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          team_id: data.team_id,
          image_url: data.imageURL // Gửi chuỗi base64 ảnh nếu có
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Thêm nhân viên thành công!");
        setOpenAddDialog(false); // Đóng dialog
        fetchUsers(); // Tải lại danh sách ngay lập tức để hiện nhân viên mới
      } else {
        alert("❌ Lỗi: " + result.msg);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Lỗi kết nối đến Server! Vui lòng kiểm tra lại Backend.");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">People (Nhân sự)</h1>
        
      </div>

      {/* Hiển thị lỗi nếu API không chạy */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
           <div className="flex items-center">
             <AlertCircle className="w-5 h-5 mr-2" />
             <span>{error}</span>
           </div>
           <Button variant="outline" size="sm" onClick={fetchUsers} className="bg-white border-red-200 hover:bg-red-50">
             <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
           </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setOpenAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm nhân sự
          </Button>

          {/* Team Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                {selectedTeam === "all" ? "All Teams" : getTeamName(selectedTeam)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedTeam("all")}>All Teams</DropdownMenuItem>
              {uniqueTeams.map((teamId) => (
                <DropdownMenuItem key={teamId} onClick={() => setSelectedTeam(teamId)}>
                  {getTeamName(teamId)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 px-3"><List className="w-4 h-4" /></Button>
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 px-3"><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant={viewMode === "teams" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("teams")} className="h-8 px-3"><Users className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {filteredPeople.length} trên tổng {users.length} nhân sự
            {selectedTeam !== "all" && ` trong team ${getTeamName(selectedTeam)}`}
            </p>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
             <div className="text-center py-12 text-gray-500">Đang tải dữ liệu từ Database...</div>
        ) : error ? (
            <div className="text-center py-12">
               <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Lỗi kết nối</h3>
               <p className="text-gray-600 dark:text-gray-400">Không lấy được danh sách nhân viên.</p>
            </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy ai</h3>
            <p className="text-gray-600 dark:text-gray-400">Hãy thử thay đổi bộ lọc hoặc kiểm tra Database.</p>
          </div>
        ) : (
          <>
            {viewMode === "list" && <ListView />}
            {viewMode === "grid" && <GridView />}
            {viewMode === "teams" && <TeamsView />}
          </>
        )}
      </div>

      <AddEmployeeDialog open={openAddDialog} onOpenChange={setOpenAddDialog} onSubmit={handleAddEmployee} />
    </div>
  )
}