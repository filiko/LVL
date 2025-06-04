interface TournamentPageProps {
  params: {
    id: string
  }
}

export default function TournamentPage({ params }: TournamentPageProps) {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Tournament Details</h1>
      <div className="grid gap-6">
        {/* Tournament details will go here */}
        <p>Tournament ID: {params.id}</p>
      </div>
    </div>
  )
} 