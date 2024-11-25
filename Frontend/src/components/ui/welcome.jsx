import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WelcomeMessage = ({ onSeedActors, isLoading }) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Welcome! Your database is empty 👋</h3>
            <p className="text-sm text-gray-600">
                {isLoading 
                    ? "Adding actors and fetching their filmographies from TMDB, this might take a while, refresh the page at any time ..."
                    : "Get started by seeding the database with 100 famous actors"}            
            </p>
          </div>
          <Button 
            onClick={onSeedActors} 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 shrink-0 ml-4"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Seeding...
              </>
            ) : (
              'Seed Database'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { WelcomeMessage };