import { Col, Button, Tabs, notification, Table, Space, Popover } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import RestaurantCard from '../../components/RestaurantCard';
import Comment from '../../components/CommentPanel';
import FirebaseService from '../../services/FirebaseService';
import requireOwnerAuth from '../../Hoc/requireOwnerAuth';
import { useGetRestaurants } from '../../Hooks/useGetRestaurants';
import { generateUUID } from '../../utils/helper';
import { useGetAdminRestaurantsReviews } from '../../Hooks/useGetAdminRestaurantsReviews';
import { useGetAdminAllUsers } from '../../Hooks/useGetAdminAllUsers';
import AdminEditReview from '../../components/AdminEditReview';
import AdminEditUser from '../../components/AdminEditUser';
import '../../asset/scss/Admin.scss';

const { TabPane } = Tabs;

function Admin(props) {
  const [update, setUpdate] = useState("");
  const [userUpdate, setUserUpdate] = useState("");
  const { users, usersLoader } = useGetAdminAllUsers(userUpdate);
  const { documents, loader } = useGetRestaurants(update);
  const { reviewLoader, reviews } = useGetAdminRestaurantsReviews(update);
  const [openEditReviewModal, setOpenEditReviewModal] = useState(false);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [loading, setloading] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState("");

  const onSumitAdminEditReview = (values) => {
    const id = generateUUID();
    FirebaseService.adminEditRestaurantReviewRequest(values.id, values)
      .then(() => {
        FirebaseService.updateARestaurantRequest(values.restaurantId, {
          rating: Math.floor(reviews && reviews.filter(item => item.restaurantId === values.restaurantId).map(i => i.rate).reduce((a, b) => a + b, Number(values.rate)) / (reviews.filter(item => item.restaurantId === values.restaurantId).length + 1)),
        })
          .then(() => {
            setloading(false);
            notification.success({
              message: "Review Edited Successfully!"
            })
            setUpdate(id);
            setOpenEditReviewModal(false);
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
  }

  const onSumitAdminEditUser = (values) => {
    const id = generateUUID();
    setloading(true);
    notification.warning({
      message: "Loading....",
      key: "updateRes"
    })
    FirebaseService.adminUpdateUserDetailsRequest(values.id, values)
      .then(() => {
        setUserUpdate(id)
        setloading(false);
        setOpenEditUserModal(false);
        notification.success({
          message: "User Edited Successfully!",
          key: "updateRes"
        });
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

  const handleDeleteUser = (values) => {
    const id = generateUUID();
    notification.warning({
      message: "Loading....",
      key: "del"
    })
    FirebaseService.adminDeleteUserDetailsRequest(values.id)
      .then(() => {
        FirebaseService.AdminDeleteAllUserRestaurantRequest(values.id)
          .then(async () => {
            await FirebaseService.AdminDeleteAllUserRestaurantReviewsRequest(values.id);
            await FirebaseService.AdminDeleteAllUserReviewsRequest(values.id);
            notification.success({
              message: "User Deleted Successfully!",
              key: "del"
            })
            setUserUpdate(id);
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

  const handleDeleteReview = (values) => {
    const id = generateUUID();
    notification.warning({
      message: "Loading....",
      key: "del"
    })
    const b = [...reviews];
    const filteredReviews = b && b.filter(item => item.restaurantId === values.restaurantId).filter(item => item.id !== values.id);
    FirebaseService.adminDeleteRestaurantReviewRequest(values.id)
      .then(() => {
        FirebaseService.updateARestaurantRequest(values.restaurantId, {
          rating: Math.floor(filteredReviews && filteredReviews.map(i => i.rate).reduce((a, b) => a + b, Number(values.rate)) / (filteredReviews.length + 1)),
          reviews: filteredReviews.length,
        })
          .then(() => {
            setloading(false);
            notification.success({
              message: "Review Deleted Successfully!",
              key: "del"
            })
            setUpdate(id);
          })
          .catch(err => {
            setloading(false);
            notification.success({
              message: "An error occured, please try again!",
              key: "del"
            })
            console.log(err);
          })
      })
      .catch(err => {
        setloading(false);
        notification.success({
          message: "An error occured, please try again!",
          key: "del"
        })
        console.log(err);
      })
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Type',
      dataIndex: 'userType',
      key: 'userType',
    },
    {
      title: 'Action',
      key: 'id',
      dataIndex: 'id',
      fixed: 'right',
      width: 100,
      render: (id, records) => (
        <Space size="middle">
          <Button type="primary" onClick={() => setOpenEditUserModal(records)} icon={<EditOutlined />} />
          <Popover
            content={
              <div>
                Are you sure you want to delete this user?
                <br />
                <button
                  style={{padding: "5px 10px", color: "white", backgroundColor: "red", border: "none"}}
                  onClick={() => {
                    handleDeleteUser(records)
                    setDeleteBtn("")
                  }}
                >
                  Yes
                </button>
              </div>
            }
            trigger="click"
            visible={deleteBtn === id}
            onVisibleChange={() => setDeleteBtn(deleteBtn !== id ? id : null)}
          >
            <Button type="default" style={{ border: "1px solid", backgroundColor: "red", color: "white" }} icon={<DeleteOutlined />} />
          </Popover>
        </Space>
      ),
    },
  ];

  return (
    <div className="Admin">
      <Nav />
      <AdminEditReview
        openModal={openEditReviewModal}
        setOpenModal={setOpenEditReviewModal}
        initialValues={openEditReviewModal}
        loading={loading}
        onSubmit={(val) => onSumitAdminEditReview(val)}
      />
      {openEditUserModal && (
        <AdminEditUser
          openModal={openEditUserModal}
          setOpenModal={setOpenEditUserModal}
          initialValues={openEditUserModal}
          loading={loading}
          onSubmit={(val) => onSumitAdminEditUser(val)}
        />
      )}
      <div className="Admin-Container">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Restaurants" key="1">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <h2 style={{ padding: "0px 15px" }}>Restaurants</h2>
            </div>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ paddingTop: 0 }} className="Admin-Container-list">
              <div style={{ padding: "0px 10px 15px" }} className="Admin-Container-list_filtered-list">
                {
                  documents.length > 0 ? (
                    documents.map((item, i) => (
                      <RestaurantCard key={i} data={item} history={props.history} />
                    ))
                  ) : (
                    <div className="Admin-Container-list_filtered-list-empty">
                      <h2>{loader ? "Loading...." : "No restaurant yet Boss. Please add your first restaurant today."}</h2>
                    </div>
                  )
                }
              </div>
            </Col>
          </TabPane>
          <TabPane tab="Reviews" key="2">
            <h2 style={{ padding: "10px 15px" }}>Reviews</h2>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="Admin-Container-filter">
              <div>
                {
                  reviews.length > 0 ? (
                    reviews.map((item, i) => (
                      <Comment key={i} data={item} setUpdate={setUpdate} handleDelete={handleDeleteReview} selectedComment={setOpenEditReviewModal} />
                    ))
                  ) : (
                    <div className="Admin-Container-filter_empty">
                      <h2>{reviewLoader ? "Loading...." : "No Review yet Boss."}</h2>
                    </div>
                  )
                }
              </div>
            </Col>
          </TabPane>
          <TabPane tab="Users" key="3">
            <h2 style={{ padding: "10px 15px" }}>Users</h2>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="Admin-Container-filter">
              <Table loading={usersLoader} dataSource={users} columns={columns} />
            </Col>
            <p>Users</p>
          </TabPane>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default requireOwnerAuth(Admin);
