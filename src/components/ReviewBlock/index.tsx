import { useState, useEffect } from 'react';

import { Col } from "antd";
import { ReviewBlockProps, TripAdvisorReview } from './types';
import { Fade } from "react-awesome-reveal";
import { SvgIcon } from "../../common/SvgIcon";

import {
  ContentWrapper,
  ReviewSection,
  StyledRow,
} from "./styles";
import SwipeSelectionPage from '../ReviewCard';


const ReviewBlock =  ({
  id,
  direction,
  icon,
  title,
}: ReviewBlockProps) => {
  const [data, setData] = useState<TripAdvisorReview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const response = await fetch('https://api.content.tripadvisor.com/api/v1/location/8459167/reviews?language=en&key=3B95135774E648E59A6282AA0DCFFA7E', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://amanlig.com',
            'Referer': 'https://amanlig.com'
          }
      });
        const result = await response.json();
        setData(result);
        console.log(data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    fetchData();
  }, []);

  return (
    <ReviewSection>
      <Fade direction={direction} triggerOnce>
        <StyledRow
          justify="space-between"
          align="middle"
          id={id}
          direction={direction}
        >
          <Col lg={11} md={11} sm={12} xs={24}>
            <SvgIcon src={icon} width="100%" height="100%" />
          </Col>
          <Col lg={11} md={11} sm={11} xs={24}>
            <ContentWrapper>
              <h6>{title}</h6>
              <SwipeSelectionPage />
            </ContentWrapper>
          </Col>
        </StyledRow>
      </Fade>
    </ReviewSection>
  );
};

export default ReviewBlock;
