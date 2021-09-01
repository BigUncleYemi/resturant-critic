import { Form, Button, Modal, Input, Radio } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';

const rules = {
  name: [
		{ 
			required: true,
			message: 'Please input your name'
		},
  ],
	email: [
		{ 
			required: true,
			message: 'Please input your email address'
		},
		{ 
			type: 'email',
			message: 'Please enter a validate email!'
		}
	]
};

export default function AdminEditUser(props) {
  const {
    openModal,
    setOpenModal,
    onSubmit,
    initialValues,
    loading,
  } = props;
  const [form] = Form.useForm();

  const onFormSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        ...initialValues,
        ...values,
      });
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      visible={openModal}
      onCancel={() => setOpenModal(false)}
      footer={null}
    >
      <Form
        name="edit-user-form"
        onFinish={onFormSubmit}
        form={form}
        initialValues={initialValues}
        layout="vertical"
      >
        <Form.Item 
          name="name" 
          label="Name" 
          rules={rules.name}
          hasFeedback
        >
          <Input prefix={<UserOutlined className="text-primary" />}/>
        </Form.Item>
        <Form.Item 
          name="email" 
          label="Email" 
          rules={rules.email}
          hasFeedback
        >
          <Input disabled prefix={<MailOutlined className="text-primary" />}/>
        </Form.Item>
        <Form.Item
          name="userType"
          label="Change User Role ?"
          rules={[{ required: true, message: 'Please select an option!' }]}
        >
          <Radio.Group>
            <Radio.Button value="regular">🤵‍♂️&emsp;Regular User</Radio.Button>
            <Radio.Button value="owner">🧑‍🍳&emsp;Restaurant Owner</Radio.Button>
          </Radio.Group>
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