import { Form, Col, Button, Tabs, Modal, Input, Upload, notification } from 'antd';
import { UploadOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import RestaurantCard from '../../components/RestaurantCard';
import Comment from '../../components/CommentPanel';
import requireOwnerAuth from '../../Hoc/requireOwnerAuth';
import { storage } from '../../services/Firebase';
import FirebaseService from '../../services/FirebaseService';
import * as actionTypes from '../../redux/constants';
import { useGetOwnerRestaurants } from '../../Hooks/useGetOwnerRestaurants';
import { generateUUID } from '../../utils/helper';
import { useGetOwnerRestaurantsReviews } from '../../Hooks/useGetOwnerRestaurantsReviews';
import '../../asset/scss/Home.scss';

const { TabPane } = Tabs;

function OwnerDashboard(props) {
  const [update, setUpdate] = useState("");
  const { documents, loader } = useGetOwnerRestaurants(update);
  const { reviewLoader, reviews } = useGetOwnerRestaurantsReviews(update);
  const [uploading, setUploading] = useState(false);
  const [loading, setloading] = useState(false);
  const [url, setUrl] = useState("https://via.placeholder.com/300");
  const [form] = Form.useForm();
  const [openAddRestaurantModal, setOpenAddRestaurantModal] = useState(false);
  const onSubmit = () => {
    form.validateFields().then(values => {
      setloading(true);
      const id = generateUUID();
      values.image = url;
      values.id = id;
      values.rating = 0;
      values.reviews = 0;
      values.ownerId = localStorage.getItem(actionTypes.AUTH_TOKEN_ID);
      FirebaseService.postNewRestaurantRequest(id, values)
        .then(() => {
          setloading(false);
          notification.success({
            message: "Restaurant Added Successfully!"
          })
          form.resetFields();
          setOpenAddRestaurantModal(false);
          setUpdate(id);
        }).catch(err => {
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

  const normFile = async (info) => {
    setUploading(true);
    let fileList = [...info.fileList];
    if (fileList.length === 0) return;
    fileList = fileList.slice(-1);
    await fileList.map(async (file) => {
      const media = file;
      const filename = media.name;
      const filesize = media.size / 1024 / 1024;
      const lastDot = filename.lastIndexOf('.');
      const ext = filename.slice(lastDot + 1);
      if (filesize > 20) {
        notification.error({ message: 'Maximum image size should be 20MB' });
        file.status = 'error';
        setUploading(false);
      } else if (
        ext !== 'JPG'
        && ext !== 'jpg'
        && ext !== 'jpeg'
        && ext !== 'png'
      ) {
        notification.error({
          message: 'File extension should only be jpg, jpeg, or png',
        });
        file.status = 'error';
        setUploading(false);
      } else {
        const ref = storage.ref(`/restaurant-images/${Date.now()}${file.name}`);
        const uploadTask = ref.put(file);
        uploadTask.on("state_changed", console.log, console.error, () => {
          ref
            .getDownloadURL()
            .then((url) => {
              file.url = url;
              setUrl(url);
              file.status = 'done';
              setUploading(false);
            }).catch(() => {
              setUploading(false);
              file.status = 'error';
            });
        });
      }
    });
  };

  const handleStatusChange = (info) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-5);
    fileList.forEach(function (file,) {
      file.status = file?.originFileObj?.status;
    });
  };

  return (
    <div className="Home">
      <Nav />
      <Modal
        visible={openAddRestaurantModal}
        onCancel={() => setOpenAddRestaurantModal(false)}
        footer={null}
      >
        <Form
          name="add-restaurant-form"
          onFinish={onSubmit}
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Restaurant Name"
            name="name"
            hasFeedback
            rules={[{ required: true, message: 'Please input your restaurant name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Restaurant Email"
            name="email"
            type="email"
            hasFeedback
            rules={[{ required: true, message: 'Please input your restaurant email!' }]}
          >
            <Input type="email" prefix={<MailOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item
            label="Restaurant Phone Number"
            name="phoneNumber"
            hasFeedback
            rules={[{ required: true, message: 'Please input your restaurant phone number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Restaurant address"
            name="address"
            hasFeedback
            rules={[{ required: true, message: 'Please input its address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="image"
            label="Restaurant Photo"
            valuePropName="fileList"
            getValueFromEvent={() => {}}
            extra="Please upload a picture with aspect ratio 16:9, Thank you 😉."
          >
            <Upload
              maxCount={1}
              listType="picture"
              beforeUpload={(_, o) => normFile({ fileList: o })}
              valuePropName="fileList"
              onChange={(e) => handleStatusChange(e)}
            >
              <Button icon={<UploadOutlined />}>
                {uploading ? 'Uploading...' : 'Click to upload'}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className="Home-Container">
        <Tabs defaultActiveKey="1">
          <TabPane tab="My Restaurants" key="1">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <h2 style={{ padding: "0px 15px"}}>My Restaurants</h2>
              <Button onClick={() => setOpenAddRestaurantModal(true)}>
                Add Restaurant
              </Button>
            </div>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ paddingTop: 0 }} className="Home-Container-list">
              <div style={{ padding: "0px 10px 15px"}} className="Home-Container-list_filtered-list">
                {
                  documents.length > 0 ? (
                    documents.map((item, i) => (
                      <RestaurantCard key={i} data={item} history={props.history} />
                    ))
                  ) : (
                    <div className="Home-Container-list_filtered-list-empty">
                      <h2>{loader ? "Loading...." : "No restaurant yet Boss. Please add your first restaurant today."}</h2>
                    </div>
                  )
                }
              </div>
            </Col>
          </TabPane>
          <TabPane tab="Reviews" key="2">
            <h2 style={{ padding: "10px 15px"}}>Reviews</h2>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="Home-Container-filter">
              <div>
                {
                  reviews.length > 0 ? (
                    reviews.map((item, i) => (
                      <Comment key={i} data={item} setUpdate={setUpdate} />
                    ))
                  ) : (
                    <div className="Home-Container-filter_empty">
                      <h2>{reviewLoader ? "Loading...." : "No Review yet Boss."}</h2>
                    </div>
                  )
                }
              </div>
            </Col>
          </TabPane>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default requireOwnerAuth(OwnerDashboard);
