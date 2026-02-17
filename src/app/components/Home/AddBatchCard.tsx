"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useMutation, gql } from "@apollo/client"
import { Label } from "@/components/ui/label"

// GraphQL mutation
const CREATE_BATCH = gql`
  mutation CreateBatch($name: String!, $secCount: Int!) {
    createBatch(name: $name, secCount: $secCount)
  }
`

export default function AddBatchCard() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [secCount, setSecCount] = useState("")
  const [createBatch, { loading }] = useMutation(CREATE_BATCH)

  const handleSubmit = async () => {
    if (!name || !secCount) {
      alert("Please fill in both fields.")
      return
    }

    try {
      await createBatch({
        variables: {
          name,
          secCount: parseInt(secCount),
        },
      })
      alert("✅ Batch created successfully")
      setOpen(false)
      setName("")
      setSecCount("")
    } catch (error) {
      console.error("Mutation error:", error)
      alert("❌ Failed to create batch")
    }
  }

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="cursor-pointer transition-all duration-300 p-4 bg-[#1e1e1e] border-2 border-dashed border-orange-300 shadow-md rounded-2xl hover:shadow-lg hover:scale-105 hover:border-orange-300 hover:ring-2 hover:ring-orange-200 group h-32 w-full"
      >
        <CardContent className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-400 rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="w-5 h-5"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-200 group-hover:text-orange-200 transition-colors mb-2">
            Add a Batch
          </h2>
          <p className="text-gray-300 text-sm opacity-70 group-hover:opacity-90 transition-opacity">
            Create new batch
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1e1e1e] border-orange-300 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-orange-300 text-lg">Create New Batch</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name" className="text-orange-200">Batch Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-[#2a2a2a] text-gray-100 border-orange-400 focus-visible:ring-orange-300"
                placeholder="e.g. batch24-28"
              />
            </div>

            <div>
              <Label htmlFor="secCount" className="text-orange-200">Number of Sections</Label>
              <Input
                id="secCount"
                type="number"
                value={secCount}
                onChange={e => setSecCount(e.target.value)}
                className="bg-[#2a2a2a] text-gray-100 border-orange-400 focus-visible:ring-orange-300"
                placeholder="e.g. 4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-400 text-black hover:bg-orange-300"
            >
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
