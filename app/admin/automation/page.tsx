import { AutomatedWorkflow } from '@/components/admin/automated-workflow'

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automation</h1>
        <p className="text-muted-foreground">
          Configure and monitor your fully automated content pipeline
        </p>
      </div>
      <AutomatedWorkflow />
    </div>
  )
}
