import { Form, Button, Modal, Input, Divider, notification, Space, Popover } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { connect } from 'react-redux';
import FirebaseService from '../services/FirebaseService';
import '../asset/scss/Home.scss';
import { generateUUID } from '../utils/helper';
import moment from 'moment';

function Comment(props) {
  const {
    data,
    setUpdate,
    selectedComment = () => {},
    handleDelete = () => {},
  } = props;
  const array = new Array(data.rate).fill("");
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [loading, setloading] = useState(false);
  const [form] = Form.useForm();

  const onSubmit = () => {
    form.validateFields().then(values => {
      const id = generateUUID();
      setloading(true);
      FirebaseService.replyRestaurantReviewRequest(data.id, { reply: values.reply })
        .then(() => {
          setloading(false);
          notification.success({
            message: "Reply posted Successfully!"
          })
          form.resetFields();
          setUpdate(id);
          setOpenReplyModal(false);
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
    <div className="comment">
      {openReplyModal && (
        <Modal
          visible={openReplyModal}
          onCancel={() => setOpenReplyModal(false)}
          footer={null}
        >
          <div>
            <h3 style={{ marginBottom: 4 }}>{data.reviewer}</h3>
            <h4>{data.restaurantName}</h4>
            <div style={{ marginBottom: 4 }}>
              {array.map((_, ind) => <i key={ind} className="fas fa-star"></i>)}
            </div>
            <p>
              {data.review}
            </p>
          </div>
          <Form
            name="reply-review-form"
            onFinish={onSubmit}
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Reply"
              name="reply"
              hasFeedback
              rules={[{ required: true, message: 'Please input your reply!' }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
      {props.user && props.user.userType === "admin" && (
        <div style={{display: "flex", justifyContent: "flex-end"}}>
          <Space size="middle">
            <Button onClick={() => selectedComment({...data, date: moment(data.date, "DD MMM YYYY")})} type="primary" icon={<EditOutlined />} />
            <Popover
              content={
                <div>
                  Are you sure you want to delete this comment?
                  <br />
                  <button
                    style={{padding: "5px 10px", color: "white", backgroundColor: "red", border: "none"}}
                    onClick={() => {
                      handleDelete(data)
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
      <h3 style={{ marginBottom: 4 }}>{data.reviewer}</h3>
      <h4>{data.restaurantName}</h4>
      <div style={{ marginBottom: 4 }}>
        {array.map((item, ind) => <i key={ind} className="fas fa-star"></i>)}
      </div>
      <p>
       {data.review}
      </p>
      <span style={{color: "0e0e0e", fontWeight: "800"}}> Date of visit: {data.date}</span>
      {props.user && props.user.userType === "owner" && !data.reply && (
        <Button style={{ border: "none" }} onClick={() => setOpenReplyModal(true)}>
          Reply Comment
        </Button>
      )}
      {
        data.reply && data.reply && (
          <div style={{ padding: 20 }}>
            <Divider orientation="left">Reply</Divider>
            <h3 style={{ marginBottom: 4 }}>{data.restaurantName}</h3>
            <p>
              {data.reply}
            </p>
          </div>
      )}
      <hr />
    </div>
  )
}

const mapStateToProps = ({ auth }) => {
  const {
    user,
  } = auth;
  return {
    user,
  };
};

export default connect(mapStateToProps)(Comment);