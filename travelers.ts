export interface Traveler {
  id: string;
  age: number;
  interests: string[];
  preferredDuration: number;
  accessibility: boolean;
  siteName: string;
  sitesVisited: string[];
  tourDuration: number;
  routeId: string;
  touristRating: number;
  systemResponseTime: number;
  recommendationAccuracy: number;
  vrExperienceQuality: number;
  satisfaction: number;
}

export const travelers: Traveler[] = [
  {
    id: "1",
    age: 48,
    interests: ['Architecture', 'Art', 'History'],
    preferredDuration: 5,
    accessibility: false,
    siteName: "Eiffel Tower",
    sitesVisited: ['Eiffel Tower', 'Great Wall of China', 'Taj Mahal'],
    tourDuration: 7,
    routeId: "1000",
    touristRating: 1.6,
    systemResponseTime: 3.73,
    recommendationAccuracy: 97,
    vrExperienceQuality: 4.5,
    satisfaction: 3
  },
  {
    id: "2",
    age: 37,
    interests: ['Cultural', 'Nature'],
    preferredDuration: 6,
    accessibility: false,
    siteName: "Colosseum",
    sitesVisited: ['Great Wall of China'],
    tourDuration: 1,
    routeId: "2000",
    touristRating: 2.6,
    systemResponseTime: 2.89,
    recommendationAccuracy: 90,
    vrExperienceQuality: 4.5,
    satisfaction: 3
  },
  {
    id: "3",
    age: 43,
    interests: ['History', 'Art', 'Architecture'],
    preferredDuration: 6,
    accessibility: true,
    siteName: "Machu Picchu",
    sitesVisited: ['Eiffel Tower'],
    tourDuration: 2,
    routeId: "3000",
    touristRating: 1.7,
    systemResponseTime: 2.22,
    recommendationAccuracy: 94,
    vrExperienceQuality: 4.7,
    satisfaction: 3
  },
  {
    id: "4",
    age: 46,
    interests: ['Cultural', 'Art', 'Architecture'],
    preferredDuration: 8,
    accessibility: false,
    siteName: "Colosseum",
    sitesVisited: ['Machu Picchu', 'Taj Mahal'],
    tourDuration: 5,
    routeId: "4000",
    touristRating: 2.0,
    systemResponseTime: 2.34,
    recommendationAccuracy: 92,
    vrExperienceQuality: 4.7,
    satisfaction: 3
  },
  {
    id: "5",
    age: 53,
    interests: ['Architecture', 'Art'],
    preferredDuration: 5,
    accessibility: true,
    siteName: "Colosseum",
    sitesVisited: ['Machu Picchu', 'Taj Mahal', 'Great Wall of China'],
    tourDuration: 7,
    routeId: "5000",
    touristRating: 3.7,
    systemResponseTime: 2.0,
    recommendationAccuracy: 96,
    vrExperienceQuality: 4.8,
    satisfaction: 4
  }
];
