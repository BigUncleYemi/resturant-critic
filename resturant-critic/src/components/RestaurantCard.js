import { Col } from 'antd';
import '../asset/scss/Home.scss';

export default function RestaurantCard(props) {
  const { 
    data =  {
      image: "",
      name: "",
      address: "",
      email: "",
      phoneNumber: "",
      rating: "",
      reviews: "",
      id: "",
    },
  } = props;

  return (
    <Col
      xs={24}
      sm={24}
      md={12}
      lg={8}
      xl={8}
    >
      <div onClick={() => props.history.push(`/${data.id}`)} className="restaurant-card">
        <div
          className="restaurant-card_img"
          style={{ backgroundImage: `url(${data.image})` }}
        />
        <div>
          <div className="restaurant-card-body">
            <h3>{data.name}</h3>
            <p>{data.address}</p>
            <p>{data.email}</p>
            <p>{data.phoneNumber}</p>
          </div>
          <div className="restaurant-card_stat">
            <div>
              <span>
                <strong>{data.rating}★</strong>
              </span>
            </div>&emsp;
            <div>
              <span>
                <strong>{data.reviews}</strong> Reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </Col>
  )
}
