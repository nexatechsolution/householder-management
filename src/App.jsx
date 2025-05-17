import React, { useState } from "react";
import './App.css'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Card,
  Collapse,
  Divider,
  message,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const ageFromDOB = (dob) => {
  const birthDate = dayjs(dob);
  const now = dayjs();

  const years = now.diff(birthDate, "year");
  const months = now.diff(birthDate.add(years, "year"), "month");

  return `${years} वर्ष${years !== 1 ? "े" : ""}${
    months > 0 ? `, ${months} महिने` : ""
  }`;
};

const App = () => {
  const [households, setHouseholds] = useState([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHeadId, setEditingHeadId] = useState(null);

  const showModal = (headId = null) => {
    setEditingHeadId(headId);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFinish = (values) => {
    const formattedDOB = values.dob.format("YYYY-MM-DD");
    const newEntry = {
      id: Date.now(),
      name: values.name,
      gender: values.gender,
      dob: formattedDOB,
      members: [],
    };

    if (editingHeadId === null) {
      setHouseholds([...households, newEntry]);
      message.success("घराचा प्रमुख यशस्वीरित्या जोडला गेला!");
    } else {
      setHouseholds((prev) =>
        prev.map((hh) =>
          hh.id === editingHeadId
            ? {
                ...hh,
                members: [
                  ...hh.members,
                  {
                    id: Date.now(),
                    name: values.name,
                    gender: values.gender,
                    dob: formattedDOB,
                  },
                ],
              }
            : hh
        )
      );
      message.success("कुटुंब सदस्य यशस्वीरित्या जोडला गेला!");
    }

    form.resetFields();
    setIsModalVisible(false);
  };

  const getAllPeople = () => households.flatMap((hh) => [hh, ...hh.members]);

  const counts = () => {
    const all = getAllPeople();
    const males = all.filter((p) => p.gender === "Male");
    const females = all.filter((p) => p.gender === "Female");
    const age0to5 = all.filter((p) => {
      const y = dayjs().diff(dayjs(p.dob), "year");
      return y <= 5;
    });
    const ageAbove30 = all.filter((p) => {
      const y = dayjs().diff(dayjs(p.dob), "year");
      return y > 30;
    });
    return { males, females, age0to5, ageAbove30, total: all };
  };

  const columns = [
    {
      title: "घर क्र.",
      key: "homeNo",
      width: 30,
      fixed: "left",
      render: (_, __, index) => `${index + 1}`,
      onCell: () => ({ style: { minWidth: 50 } }),
    },
    {
      title: "नाव",
      dataIndex: "name",
      key: "name",
      width: 140,
      onCell: () => ({ style: { minWidth: 120 } }),
    },
    {
      title: "वय",
      dataIndex: "dob",
      key: "dob",
      width: 100,
      render: (text) => <Text>{ageFromDOB(text)}</Text>,
      onCell: () => ({ style: { minWidth: 80 } }),
    },
    {
      title: "लिंग",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      onCell: () => ({ style: { minWidth: 80 } }),
      render: (text) => (text === "Male" ? "पुरुष" : "स्त्री"),
    },
    {
      title: "क्रिया",
      key: "action",
      width: 50,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => showModal(record.id)}
          block
          style={{ borderRadius: 4 }}
        >
          जोडा
        </Button>
      ),
      onCell: () => ({ style: { minWidth: 50 } }),
    },
  ];

  const expandedRowRender = (record) => {
    const memberCols = [
      {
        title: "नाव",
        dataIndex: "name",
        key: "name",
        width: 140,
        onCell: () => ({ style: { minWidth: 120 } }),
      },
      {
        title: "वय",
        dataIndex: "dob",
        key: "dob",
        render: (text) => <Text>{ageFromDOB(text)}</Text>,
        width: 100,
        onCell: () => ({ style: { minWidth: 80 } }),
      },
      {
        title: "लिंग",
        dataIndex: "gender",
        key: "gender",
        width: 100,
        onCell: () => ({ style: { minWidth: 80 } }),
        render: (text) => (text === "Male" ? "पुरुष" : "स्त्री"),
      },
    ];
    return (
      <Table
        columns={memberCols}
        dataSource={record.members}
        pagination={false}
        rowKey="id"
        size="small"
        scroll={{ x: 350 }}
      />
    );
  };

  const { males, females, age0to5, ageAbove30, total } = counts();

  const renderPersonList = (people) =>
    people.map((p) => (
      <Card
        size="small"
        key={p.id}
        style={{
          marginBottom: 8,
          borderRadius: 8,
          boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
          backgroundColor: "#fafafa",
          border: "1px solid #e6e6e6",
        }}
      >
        <Text strong>{p.name}</Text> - <Text>{ageFromDOB(p.dob)}</Text>
      </Card>
    ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap');

        body {
          font-family: 'Noto Sans Devanagari', sans-serif;
         
          margin: 0;
          padding: 0;
        }
        .app-container {
          max-width: 480px;
          margin: 20px auto;
          padding: 24px 20px;
          background: #fff;
          border-radius: 12px;
       
        }
        .ant-table {
          font-size: 14px;
        }
        .ant-table-thead > tr > th {
          background: #f5f5f5;
          font-weight: 600;
          color: #222;
          border-bottom: 2px solid #e0e0e0;
        }
        .ant-btn-primary {
          background-color: #1890ff;
          border-color: #1890ff;
          font-weight: 600;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        .ant-btn-primary:hover {
          background-color: #40a9ff;
          border-color: #40a9ff;
        }
        .ant-collapse-header {
          font-weight: 600;
          font-size: 15px;
          color: #0a3d62;
        }
        .ant-modal-content {
          border-radius: 12px;
        }
        .ant-form-item-label > label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }
        .ant-input, .ant-picker, .ant-select-selector {
          border-radius: 6px;
          font-size: 14px;
        }
      `}</style>

      <div className="app-container">
        <Title level={3} style={{ textAlign: "center", marginBottom: 24, color: "#0a3d62" }}>
          घरगुती माहिती
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          block
          size="large"
          style={{ marginBottom: 20, borderRadius: 6 }}
        >
          घराचा प्रमुख जोडा
        </Button>

        <Divider orientation="left" plain style={{ fontWeight: "600", color: "#555" }}>
          सविस्तर माहिती
        </Divider>

        <Table
          columns={columns}
          expandable={{ expandedRowRender }}
          dataSource={households}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
          size="middle"
          scroll={{ x: 600 }}
        />

        <Divider orientation="left" plain style={{ fontWeight: "600", color: "#555" }}>
          आकडेवारी
        </Divider>

        <Card size="small" style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
          <Collapse accordion>
            <Panel header={`एकूण पुरुष: ${males.length}`} key="1">
              {renderPersonList(males)}
            </Panel>
            <Panel header={`एकूण महिला: ${females.length}`} key="2">
              {renderPersonList(females)}
            </Panel>
            <Panel header={`वय ०-५ वर्ष: ${age0to5.length}`} key="3">
              {renderPersonList(age0to5)}
            </Panel>
            <Panel header={`वय ३० वर्षांपेक्षा जास्त: ${ageAbove30.length}`} key="4">
              {renderPersonList(ageAbove30)}
            </Panel>
            <Panel header={`एकूण लोकसंख्या: ${total.length}`} key="5">
              {renderPersonList(total)}
            </Panel>
          </Collapse>
        </Card>

        <Modal
          title={editingHeadId ? "कुटुंब सदस्य जोडा" : "घराचा प्रमुख जोडा"}
          open={isModalVisible}
          onCancel={handleCancel}
          onOk={() => form.submit()}
          okText="साठवा"
          centered
          bodyStyle={{ padding: 20 }}
          width={360}
          style={{ borderRadius: 12 }}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label="नाव"
              rules={[{ required: true, message: "कृपया नाव लिहा" }]}
            >
              <Input placeholder="नाव टाका" size="large" />
            </Form.Item>
            <Form.Item
              name="dob"
              label="जन्मतारीख"
              rules={[{ required: true, message: "कृपया जन्मतारीख निवडा" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                size="large"
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
            <Form.Item
              name="gender"
              label="लिंग"
              rules={[{ required: true, message: "कृपया लिंग निवडा" }]}
            >
              <Select placeholder="लिंग निवडा" size="large">
                <Option value="Male">पुरुष</Option>
                <Option value="Female">स्त्री</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default App;
