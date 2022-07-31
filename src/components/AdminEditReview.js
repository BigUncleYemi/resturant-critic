import { Form, Button, Modal, Input, Rate, DatePicker } from 'antd';
import moment from 'moment';

export default function AdminEditReview(props) {
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
        date: values.date.format("DD MMM YYYY")
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
        name="edit-review-form"
        onFinish={onFormSubmit}
        form={form}
        initialValues={initialValues}
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
        <Form.Item
          label="Reply"
          name="reply"
          hasFeedback
          rules={[{ required: true, message: 'Please input your reply!' }]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}