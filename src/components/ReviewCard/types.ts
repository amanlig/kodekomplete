import { TFunction } from "react-i18next";
export interface ReviewBlockProps {
  id: string;
  direction: "left" | "right";
  icon: string;
  title: string;
}

export interface TestItem {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface TripAdvisorReview {
  location_id: number;
  name: string;
  description: string;
}
