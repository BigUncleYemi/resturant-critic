import { Form, Row, Col, Button, Input, Rate, Divider, Skeleton, notification, DatePicker, Result, Space, Popover } from 'antd';
import {  EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Fragment, useState } from 'react';
import moment from 'moment';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Comment from '../../components/CommentPanel';
import { useGetARestaurant } from '../../Hooks/useGetARestaurant';
import FirebaseService from '../../services/FirebaseService';
import { generateUUID } from '../../utils/helper';
import { useGetARestaurantReview } from '../../Hooks/useGetARestaurantReview';
import AdminEditRestaurant from '../../components/AdminEditRestaurant';
import '../../asset/scss/Profile.scss';

function Restaurant(props) {
  const { user } = props;
  const [update, setUpdate] = useState("");
  const { loader, documents } = useGetARestaurant(props.match.params.id, update);
  const { reviews } = useGetARestaurantReview(props.match.params.id, update);
  const [openEditRestaurantModal, setOpenEditRestaurantModal] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [loading, setloading] = useState(false);
  const [form] = Form.useForm();

  const onSumitAdminEditRestaurant = (values) => {
    setloading(true);
    const id = generateUUID();
    notification.warning({
      message: "Loading....",
      key: "updateRes"
    })
    FirebaseService.updateARestaurantRequest(values.id, values)
      .then(() => {
        FirebaseService.AdminEditRestaurantNameOnReviewRequest(values.id, {
          restaurantName: values.name,
        })
          .then(() => {
            setloading(false);
            setOpenEditRestaurantModal(false);
            notification.success({
              message: "Restaurant Edited Successfully!",
              key: "updateRes"
            });
            setUpdate(id);
          })
          .catch(err => {
            setloading(false);
            notification.success({
              message: "An error occured, please try again!",
              key: "updateRes"
            })
            console.log(err);
          })
      })
      .catch(err => {
        setloading(false);
        notification.success({
          message: "An error occured, please try again!",
          key: "updateRes"
        })
        console.log(err);
      })
  }

  const handleDeleteRestaurant = (values) => {
    const id = generateUUID();
    notification.warning({
      message: "Loading....",
      key: "del"
    })
    FirebaseService.adminDeleteRestaurantRequest(values.id)
      .then(() => {
        FirebaseService.AdminDeleteAllRestaurantReviewsRequest(values.id)
          .then(() => {
            props.history.push("/admin")
            notification.success({
              message: "Restaurant Deleted Successfully!",
              key: "del"
            })
            setUpdate(id);
          })
          .catch(err => {
            notification.success({
              message: "An error occured, please try again!",
              key: "del"
            })
            console.log(err);
          })
      })
      .catch(err => {
        notification.success({
          message: "An error occured, please try again!",
          key: "del"
        })
        console.log(err);
      })
  }

  const onSubmit = () => {
    form.validateFields().then(values => {
      setloading(true);
      let date = moment(values.date).format("DD MMM YYYY");
      values.id = generateUUID()
      values.restaurantId = props.match.params.id;
      values.restaurantOwnerId = documents.ownerId;
      values.reviewer = props.user.name;
      values.date = date;
      values.restaurantName = documents.name;
      values.reply = "";
      values.reviewerId = user.id;
      FirebaseService.postRestaurantReviewRequest(values.id, values)
        .then(() => {
          FirebaseService.updateARestaurantRequest(values.restaurantId, {
            rating: Math.floor(reviews.map(i => i.rate).reduce((a, b) => a + b, Number(values.rate)) / (reviews.length + 1)),
            reviews: reviews && reviews.length + 1,
          })
            .then(() => {
              setloading(false);
              notification.success({
                message: "Review posted Successfully!"
              })
              form.resetFields();
              setUpdate(values.id);
            })
            .catch(err => {
              setloading(false);
              notification.success({
                message: "An error occured, please try again!"
              })
              console.log(err);
            })
        })
        .catch(err => {
          setloading(false);
          notification.success({
            message: "An error occured, please try again!"
          })
          console.log(err);
        })
    }).catch(info => {
      setloading(false);
      console.log('Validate Failed:', info);
    });
  };

  return (
    <div className="Profile">
      <Nav />
      {openEditRestaurantModal && (
        <AdminEditRestaurant
          openModal={openEditRestaurantModal}
          setOpenModal={setOpenEditRestaurantModal}
          initialValues={{
            ...openEditRestaurantModal,
            image: [
              {
                uid: 0,
                name: 'Restaurant image',
                status: 'done',
                url: openEditRestaurantModal.image,
                thumbUrl: openEditRestaurantModal.image,
              },
            ]
          }}
          loading={loading}
          onSubmit={onSumitAdminEditRestaurant}
        />
      )}
      <div className="Profile-Container">
        <div className="Profile-Headline">
          {!loader ? (
            <div>
              <h2>{documents.name}</h2>
              <p>{documents.address}</p>
              <div className="Profile-Headline_stat">
                <p>
                  <strong>
                    {documents.rating}
                  </strong>★ overall average rating
                </p>&emsp;
                <p>
                  <strong>
                    {documents.reviews}
                  </strong> reviews
                </p>
              </div>
              {props.user && props.user.userType === "admin" && (
                <div style={{display: "flex", justifyContent: "flex-start"}}>
                  <Space size="middle">
                    <Button onClick={() => setOpenEditRestaurantModal(documents)} type="primary" icon={<EditOutlined />} />
                    <Popover
                      content={
                        <div>
                          Are you sure you want to delete this restaurant?
                          <br />
                          <button
                            style={{padding: "5px 10px", color: "white", backgroundColor: "red", border: "none"}}
                            onClick={() => {
                              handleDeleteRestaurant(documents)
                              setDeleteBtn(false)
                            }}
                          >
                            Yes
                          </button>
                        </div>
                      }
                      trigger="click"
                      visible={deleteBtn}
                      onVisibleChange={setDeleteBtn}
                    >
                      <Button type="default" style={{ border: "1px solid", backgroundColor: "red", color: "white" }} icon={<DeleteOutlined />} />
                    </Popover>
                  </Space>
                </div>
              )}
            </div>
            ) : (
              <div><Skeleton active paragraph /></div>
            )
          }
          <div
            style={{
              backgroundImage: `url(${documents.image})`
            }}
            className="Profile-Container-Banner"
          />
        </div>
        <div className="Profile-body">
          <div className="Profile-body-top">
            <Row justify="center">
              <Col style={{ margin: 10, textAlign: "center" }}>
                <h3>Highest Rating</h3>
                <p>
                  <strong>
                    {(reviews.length > 0 && reviews.map(i => i.rate).reduce((a, b) => Math.max(a, b))) || 0}
                  </strong>★
                </p>
              </Col>
              <Col style={{ margin: 10, textAlign: "center" }}>
                <h3>Lowest Rating</h3>
                <p>
                  <strong>
                    {(reviews.length > 0 && reviews.map(i => i.rate).reduce((a, b) => Math.min(a, b))) || 0}
                  </strong>★
                </p>
              </Col>
            </Row>
          </div>
          {!user && (
            <Fragment>
              <Divider orientation="left">Drop your review</Divider>
              <Result
                icon={<div />}
                title="Sign Up or Login to your account to drop your review and criticism 😌."
                extra={null}
              />
            </Fragment>
          )}
          {user && user.userType === "regular" && (
            <Fragment>
              <Divider orientation="left">Drop your review</Divider>
              <div className="Profile-body-center">
                <Row>
                  <Col span={24}>
                    <Form
                      name="review-form"
                      onFinish={onSubmit}
                      form={form}
                      layout="vertical"
                    >
                      <Form.Item
                        name="rate"
                        label="Rate"
                        hasFeedback
                        rules={[{ required: true, message: 'Please rate the restaurant!' }]}
                      >
                        <Rate />
                      </Form.Item>
                      <Form.Item
                        name="date"
                        label="Date of Visit"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select date you visited the restaurant!' }]}
                      >
                        <DatePicker disabledDate={(data) => moment().isBefore(data)} />
                      </Form.Item>
                      <Form.Item
                        label="Drop your Review"
                        name="review"
                        hasFeedback
                        rules={[{ required: true, message: 'Please input your review!' }]}
                      >
                        <Input.TextArea rows={7} />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit" loading={loading}>
                          Submit
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </div>
            </Fragment>
          )}
          <Divider orientation="left">Past Reviews</Divider>
          <div className="Profile-body-bottom">
            {
              reviews && reviews && reviews.map((itm, index) => (
                <Comment setUpdate={setUpdate} key={index} data={itm} />
              ))
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const mapStateToProps = ({ auth }) => {
  const {
    user,
  } = auth;
  return {
    user,
  };
};

export default connect(mapStateToProps)(Restaurant);
