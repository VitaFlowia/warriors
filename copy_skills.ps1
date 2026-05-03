$destSkills = "c:\Sa_Pires_Warriors\sapires-warriors\.claude\skills"
$destData = "c:\Sa_Pires_Warriors\sapires-warriors\.claude\skill-data"

$skillsToCopy = @(
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\agent-orchestrator"; Dest = "$destSkills\agent-orchestrator" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\dispatching-parallel-agents"; Dest = "$destSkills\dispatching-parallel-agents" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\acceptance-orchestrator"; Dest = "$destSkills\acceptance-orchestrator" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\full-stack-orchestration-full-stack-feature"; Dest = "$destSkills\full-stack-orchestration-full-stack-feature" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\agent-orchestration-improve-agent"; Dest = "$destSkills\agent-orchestration-improve-agent" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\agent-orchestration-multi-agent-optimize"; Dest = "$destSkills\agent-orchestration-multi-agent-optimize" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\react-best-practices"; Dest = "$destSkills\react-best-practices" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\composition-patterns"; Dest = "$destSkills\composition-patterns" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\web-design-guidelines"; Dest = "$destSkills\web-design-guidelines" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\react-view-transitions"; Dest = "$destSkills\react-view-transitions" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\shadcn"; Dest = "$destSkills\shadcn" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\react-component-performance"; Dest = "$destSkills\react-component-performance" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\supabase-automation"; Dest = "$destSkills\supabase-automation" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\ai-agent-development"; Dest = "$destSkills\ai-agent-development" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\ai-agents-architect"; Dest = "$destSkills\ai-agents-architect" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\autonomous-agent-patterns"; Dest = "$destSkills\autonomous-agent-patterns" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\autonomous-agents"; Dest = "$destSkills\autonomous-agents" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\agent-memory-mcp"; Dest = "$destSkills\agent-memory-mcp" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\context-agent"; Dest = "$destSkills\context-agent" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\context-manager"; Dest = "$destSkills\context-manager" },
    @{ Src = "C:\skills\agent-browser-main\agent-browser-main\skills\agent-browser"; Dest = "$destSkills\agent-browser" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\error-debugging-multi-agent-review"; Dest = "$destSkills\error-debugging-multi-agent-review" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\systematic-debugging"; Dest = "$destSkills\systematic-debugging" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\deploy-to-vercel"; Dest = "$destSkills\deploy-to-vercel" },
    @{ Src = "C:\skills\agent-skills-main\agent-skills-main\skills\vercel-cli-with-tokens"; Dest = "$destSkills\vercel-cli-with-tokens" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\cicd-automation-workflow-automate"; Dest = "$destSkills\cicd-automation-workflow-automate" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\git-advanced-workflows"; Dest = "$destSkills\git-advanced-workflows" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\git-pr-workflows-git-workflow"; Dest = "$destSkills\git-pr-workflows-git-workflow" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\project-skill-audit"; Dest = "$destSkills\project-skill-audit" },
    @{ Src = "C:\skills\antigravity-awesome-skills-main\antigravity-awesome-skills-main\skills\agents-md"; Dest = "$destSkills\agents-md" },
    @{ Src = "C:\skills\organizador-de-bliblioteca-akm-main\akm-main\.claude\skills"; Dest = "$destSkills\akm" },
    @{ Src = "C:\skills\fantastica-agent-skill-creator-main\agent-skill-creator-main"; Dest = "$destSkills\agent-skill-creator" },
    @{ Src = "C:\skills\doc-git-video-e-criaSkill_Seekers-development\Skill_Seekers-development\skills"; Dest = "$destSkills\skill-seekers" },
    @{ Src = "C:\skills\agent-browser-main\agent-browser-main\skill-data\core"; Dest = "$destData\agent-browser-core" },
    @{ Src = "C:\skills\agent-browser-main\agent-browser-main\skill-data\dogfood"; Dest = "$destData\agent-browser-dogfood" },
    @{ Src = "C:\skills\agent-browser-main\agent-browser-main\skill-data\vercel-sandbox"; Dest = "$destData\vercel-sandbox" }
)

foreach ($skill in $skillsToCopy) {
    if (Test-Path $skill.Src) {
        if (-Not (Test-Path $skill.Dest)) {
            New-Item -ItemType Directory -Force -Path $skill.Dest | Out-Null
        }
        Copy-Item -Path "$($skill.Src)\*" -Destination $skill.Dest -Recurse -Force
    } else {
        Write-Host "Warning: Skill source not found $($skill.Src)"
    }
}
Write-Host "Skills copiadas."
