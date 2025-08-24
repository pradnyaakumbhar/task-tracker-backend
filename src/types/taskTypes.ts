export interface CreateTaskData {
  title: string
  description?: string
  comment?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  tags?: string[]
  dueDate?: Date
  spaceId: string
  creatorId: string
  assigneeId?: string
  reporterId: string
}
