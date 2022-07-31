import { Row, Col, Checkbox } from 'antd';
import '../../asset/scss/Home.scss';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import RestaurantCard from '../../components/RestaurantCard';
import requireOwnerAuth from '../../Hoc/requireOwnerAuth';
import { useGetRestaurants } from '../../Hooks/useGetRestaurants';

function Home(props) {
  const [filters, setFilters] = useState([]);
  const { documents, loader } = useGetRestaurants(filters);
  return (
    <div className="Home">
      <Nav />
      <div className="Home-Container">
        <Row>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} className="Home-Container-filter">
            <div>
              <label>Filter by ratings</label>
              <Checkbox.Group onChange={setFilters} style={{ display: "flex", flexWrap: "wrap" }}>
                <Checkbox value={0} style={{ lineHeight: '32px' }}>
                  0 star
                </Checkbox>
                <Checkbox value={1} style={{ lineHeight: '32px' }}>
                  1 star
                </Checkbox>
                <Checkbox value={2} style={{ lineHeight: '32px' }}>
                  2 star
                </Checkbox>
                <Checkbox value={3} style={{ lineHeight: '32px' }}>
                  3 star
                </Checkbox>
                <Checkbox value={4} style={{ lineHeight: '32px' }}>
                  4 star
                </Checkbox>
                <Checkbox value={5} style={{ lineHeight: '32px' }}>
                  5 star
                </Checkbox>
              </Checkbox.Group>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} className="Home-Container-list">
            <div className="Home-Container-list_filtered-list">
              {
                documents.length > 0 ? (
                  documents.map((item, i) => (
                    <RestaurantCard key={i} data={item} history={props.history} />
                  ))
                ) : (
                  <div className="Home-Container-list_filtered-list-empty">
                    <h2>{loader ? "Loading...." : "No restaurant yet Boss."}</h2>
                  </div>
                )
              }
            </div>
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  );
}

export default requireOwnerAuth(Home);
