import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplaceService';

const CollaborationPanel = ({ producer, isAuthenticated, onAuthRequired }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState('');
  const [revenueSplit, setRevenueSplit] = useState({ producer: 50, collaborator: 50 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRequest = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    try {
      setSubmitting(true);
      await marketplaceService?.createCollaborationRequest(
        producer?.id,
        message,
        revenueSplit
      );
      setShowRequestForm(false);
      setMessage('');
      setRevenueSplit({ producer: 50, collaborator: 50 });
    } catch (error) {
      console.error('Submit collaboration request error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    {
      icon: 'Users',
      title: 'Real-Time Co-Production',
      description: 'Work together on beats and tracks in real-time with live collaboration tools'
    },
    {
      icon: 'DollarSign',
      title: 'Revenue Sharing',
      description: 'Transparent revenue split agreements with automated payment distribution'
    },
    {
      icon: 'MessageSquare',
      title: 'Direct Communication',
      description: 'Built-in messaging and project discussion threads'
    },
    {
      icon: 'FileText',
      title: 'Project Management',
      description: 'Track progress, versions, and milestones for collaborative projects'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Collaborate with {producer?.stageName}</h3>
            <p className="text-muted-foreground">
              Start a collaboration and create amazing music together
            </p>
          </div>
          {!showRequestForm && (
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  onAuthRequired?.();
                } else {
                  setShowRequestForm(true);
                }
              }}
              iconName="Send"
              iconPosition="left"
            >
              Send Request
            </Button>
          )}
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmitRequest} className="bg-muted/50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">Collaboration Request</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e?.target?.value)}
                placeholder="Describe your collaboration idea, project details, and what you bring to the table..."
                rows={5}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Proposed Revenue Split
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Producer</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={revenueSplit?.producer}
                      onChange={(e) => {
                        const val = parseInt(e?.target?.value);
                        setRevenueSplit({ producer: val, collaborator: 100 - val });
                      }}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-foreground w-12">
                      {revenueSplit?.producer}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">You</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={revenueSplit?.collaborator}
                      onChange={(e) => {
                        const val = parseInt(e?.target?.value);
                        setRevenueSplit({ producer: 100 - val, collaborator: val });
                      }}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-foreground w-12">
                      {revenueSplit?.collaborator}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting || !message?.trim()}>
                {submitting ? 'Sending...' : 'Send Request'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features?.map((feature, index) => (
          <div key={index} className="glass-card p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Icon name={feature?.icon} size={24} className="text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">{feature?.title}</h4>
            <p className="text-muted-foreground">{feature?.description}</p>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">How Collaboration Works</h4>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Send Request',
              description: 'Submit a collaboration request with your project idea and proposed terms'
            },
            {
              step: 2,
              title: 'Producer Reviews',
              description: 'The producer reviews your request and responds with acceptance or counter-proposal'
            },
            {
              step: 3,
              title: 'Start Creating',
              description: 'Once accepted, access the collaborative workspace and start working together'
            },
            {
              step: 4,
              title: 'Release & Earn',
              description: 'Complete the project, release it, and automatically split revenue as agreed'
            }
          ]?.map((item) => (
            <div key={item?.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{item?.step}</span>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-1">{item?.title}</h5>
                <p className="text-sm text-muted-foreground">{item?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;