import ScoreGauge from '../ui/ScoreGauge';

const ScorecardTab = ({ scorecard }) => {
  if (!scorecard) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Master Scorecard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <ScoreGauge 
          label="Difficulty (Technical)" 
          score={scorecard.difficulty} 
          inverseColor={true} 
        />
        <ScoreGauge 
          label="Competition Level" 
          score={scorecard.competition} 
          inverseColor={true} 
        />
        <ScoreGauge 
          label="Innovation Potential" 
          score={scorecard.innovation} 
        />
        <ScoreGauge 
          label="Team Fit (vs. Team Profile)" 
          score={scorecard.teamFit} 
        />
        <ScoreGauge 
          label="AI/Vibe Coding Potential" 
          score={scorecard.aiVibePotential} 
        />
        <ScoreGauge 
          label="Implementation Risk" 
          score={scorecard.implementationRisk} 
          inverseColor={true} 
        />
      </div>
    </div>
  );
};

export default ScorecardTab;