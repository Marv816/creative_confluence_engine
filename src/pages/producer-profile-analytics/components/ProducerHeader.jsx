import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProducerHeader = ({ producer, isFollowing, onFollowToggle }) => {
  const stats = [
    { label: 'Sounds', value: producer?.soundsCount || 0, icon: 'Music' },
    { label: 'Sales', value: producer?.totalSales || 0, icon: 'ShoppingCart' },
    { label: 'Followers', value: producer?.followersCount || 0, icon: 'Users' },
    { label: 'Rating', value: producer?.rating?.toFixed(1) || '0.0', icon: 'Star' }
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"
        style={{
          backgroundImage: producer?.bannerUrl ? `url(${producer?.bannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 -mt-20">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden">
              {producer?.user?.avatar_url ? (
                <img
                  src={producer?.user?.avatar_url}
                  alt={producer?.stageName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                  <Icon name="User" size={48} className="text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{producer?.stageName}</h1>
                  {producer?.isVerified && (
                    <div className="bg-blue-500 rounded-full p-1">
                      <Icon name="Check" size={16} className="text-white" />
                    </div>
                  )}
                </div>
                {producer?.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Icon name="MapPin" size={16} />
                    <span>{producer?.location}</span>
                  </div>
                )}
                {producer?.bio && (
                  <p className="text-muted-foreground max-w-2xl">{producer?.bio}</p>
                )}
              </div>

              <Button
                onClick={onFollowToggle}
                variant={isFollowing ? 'outline' : 'default'}
                iconName={isFollowing ? 'UserCheck' : 'UserPlus'}
                iconPosition="left"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {stats?.map((stat, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={stat?.icon} size={16} className="text-primary" />
                    <span className="text-sm text-muted-foreground">{stat?.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                </div>
              ))}
            </div>

            {producer?.socialLinks && Object.keys(producer?.socialLinks)?.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {producer?.socialLinks?.twitter && (
                  <a
                    href={producer?.socialLinks?.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon name="Twitter" size={20} />
                  </a>
                )}
                {producer?.socialLinks?.instagram && (
                  <a
                    href={producer?.socialLinks?.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon name="Instagram" size={20} />
                  </a>
                )}
                {producer?.socialLinks?.youtube && (
                  <a
                    href={producer?.socialLinks?.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon name="Youtube" size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerHeader;