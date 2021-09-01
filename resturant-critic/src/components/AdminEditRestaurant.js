import { Form, Button, Modal, Input, Upload, notification } from 'antd';
import { UploadOutlined, MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { storage } from '../services/Firebase';

export default function AdminEditRestaurant(props) {
  const {
    openModal,
    setOpenModal,
    onSubmit,
    initialValues,
    loading,
  } = props;
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(initialValues.image[0].url);

  const onFormSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        ...initialValues,
        ...values,
        image: url,
      });
      form.resetFields();
    }).catch(info => {
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
    <Modal
      visible={openModal}
      onCancel={() => {
        form.resetFields();
        setOpenModal(false);
      }}
      footer={null}
    >
      <Form
        name="edit-restaurant-form"
        onFinish={onFormSubmit}
        form={form}
        initialValues={initialValues}
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
  )
}
