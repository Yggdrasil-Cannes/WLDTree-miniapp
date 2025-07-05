import * as d3 from 'd3-hierarchy'

export interface FamilyMember3D {
  id: string
  name: string
  gender?: 'male' | 'female'
  birth?: string
  death?: string
  generation: number
  position: [number, number, number]
  parents?: string[]
  children?: string[]
  spouse?: string
}

export interface FamilyConnection3D {
  from: [number, number, number]
  to: [number, number, number]
  type: 'parent' | 'spouse' | 'child'
  animated: boolean
}

export interface ProcessedFamilyData3D {
  nodes: FamilyMember3D[]
  connections: FamilyConnection3D[]
}

export function processGenealogyData3D(rawData: any[]): ProcessedFamilyData3D {
  if (!rawData || rawData.length === 0) {
    return { nodes: [], connections: [] }
  }

  // Create a map for quick lookup
  const nodeMap = new Map<string, any>()
  rawData.forEach(person => nodeMap.set(person.id, person))

  // Find root person (no parents)
  const rootPerson = rawData.find(p => !p.parents || p.parents.length === 0) || rawData[0]
  
  // Build hierarchy using d3-hierarchy
  const hierarchyData = buildHierarchy(rootPerson, nodeMap, new Set())
  const root = d3.hierarchy(hierarchyData)

  // Calculate 3D positions using a tree layout
  const treeLayout = d3.tree<any>()
    .size([30, 20]) // Width and depth of the tree space
    .separation((a, b) => a.parent === b.parent ? 1.5 : 2.5)

  treeLayout(root)

  // Convert to our 3D format
  const nodes: FamilyMember3D[] = []
  const connections: FamilyConnection3D[] = []

  root.each((node) => {
    const person = node.data
    
    // Calculate 3D position
    const position: [number, number, number] = [
      (node.x || 0) - 15, // Center the tree horizontally
      -(node.depth || 0) * 8, // Vertical spacing between generations
      Math.sin((node.x || 0) * 0.1) * 3 // Add some Z variation for depth
    ]

    const processedNode: FamilyMember3D = {
      ...person,
      position,
      generation: node.depth || 0
    }

    nodes.push(processedNode)

    // Add parent-child connections
    if (node.parent) {
      const parentNode = nodes.find(n => n.id === node.parent!.data.id)
      if (parentNode) {
        connections.push({
          from: parentNode.position,
          to: position,
          type: 'parent',
          animated: true
        })
      }
    }
  })

  // Add spouse connections
  rawData.forEach(person => {
    if (person.spouse) {
      const personNode = nodes.find(n => n.id === person.id)
      const spouseNode = nodes.find(n => n.id === person.spouse)
      
      if (personNode && spouseNode) {
        connections.push({
          from: personNode.position,
          to: spouseNode.position,
          type: 'spouse',
          animated: false
        })
      }
    }
  })

  return { nodes, connections }
}

function buildHierarchy(
  person: any, 
  nodeMap: Map<string, any>, 
  visited: Set<string>
): any {
  if (visited.has(person.id)) {
    return person
  }
  
  visited.add(person.id)
  
  const children = person.children?.map((childId: string) => {
    const child = nodeMap.get(childId)
    return child ? buildHierarchy(child, nodeMap, visited) : null
  }).filter(Boolean) || []

  return {
    ...person,
    children: children.length > 0 ? children : undefined
  }
}

// DNA sequence generator for DNA helix visualization
export function generateDNASequence(familyData: any[]): Array<{
  position: [number, number, number]
  nucleotide: 'A' | 'T' | 'G' | 'C'
  member?: any
  color: string
}> {
  const sequence: Array<{
    position: [number, number, number]
    nucleotide: 'A' | 'T' | 'G' | 'C'
    member?: any
    color: string
  }> = []

  const nucleotides: Array<'A' | 'T' | 'G' | 'C'> = ['A', 'T', 'G', 'C']
  const colors = ['#ff6b9d', '#4ecdc4', '#00ff88', '#0088ff']
  
  const segmentHeight = 0.5
  const radius = 4
  const totalHeight = familyData.length * segmentHeight

  familyData.forEach((member, index) => {
    const y = index * segmentHeight - totalHeight / 2
    const angle = (index / familyData.length) * Math.PI * 8 // Multiple rotations
    
    // Left strand
    const xLeft = Math.cos(angle) * radius
    const zLeft = Math.sin(angle) * radius
    
    // Right strand
    const xRight = Math.cos(angle + Math.PI) * radius
    const zRight = Math.sin(angle + Math.PI) * radius
    
    const nucleotideIndex = index % 4
    
    sequence.push({
      position: [xLeft, y, zLeft],
      nucleotide: nucleotides[nucleotideIndex],
      member: member,
      color: colors[nucleotideIndex]
    })
    
    sequence.push({
      position: [xRight, y, zRight],
      nucleotide: nucleotides[(nucleotideIndex + 2) % 4], // Complementary base
      member: member,
      color: colors[(nucleotideIndex + 2) % 4]
    })
  })

  return sequence
} 