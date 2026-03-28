import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ exercises }) => {
  const calculateProgress = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 p-2 flex items-center justify-center">
          <Icon name="Target" size={20} color="white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Wordplay Training Progress</h3>
      </div>
      <div className="space-y-5">
        {exercises?.map((exercise) => {
          const progress = calculateProgress(exercise?.completed, exercise?.total);
          const progressColor = getProgressColor(progress);

          return (
            <div key={exercise?.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name={exercise?.icon} size={16} className="text-generator-cyan" />
                  <span className="text-sm font-medium text-foreground">{exercise?.name}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {exercise?.completed}/{exercise?.total}
                </span>
              </div>
              <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${exercise?.name} progress: ${progress}%`}
                />
              </div>
              {exercise?.achievements && exercise?.achievements?.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {exercise?.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-full"
                      title={achievement}
                    >
                      <Icon name="Award" size={12} />
                      <span className="text-xs font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Overall Progress</p>
            <p className="text-xs text-muted-foreground mt-0.5">Keep practicing to unlock achievements</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {calculateProgress(
                exercises?.reduce((sum, ex) => sum + ex?.completed, 0),
                exercises?.reduce((sum, ex) => sum + ex?.total, 0)
              )}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;