import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listTeams, createTeam, joinTeam, deleteTeam } from '../actions/teamActions';
import { TEAM_CREATE_RESET, TEAM_JOIN_RESET, TEAM_DELETE_SUCCESS } from '../constants/teamConstants';

const TeamScreen = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createTeamName, setCreateTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const teamList = useSelector((state) => state.teamList);
  const { loading, error, teams } = teamList;

  const teamCreate = useSelector((state) => state.teamCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = teamCreate;

  const teamJoin = useSelector((state) => state.teamJoin);
  const {
    loading: loadingJoin,
    error: errorJoin,
    success: successJoin,
  } = teamJoin;

  const teamDelete = useSelector((state) => state.teamDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = teamDelete;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch({ type: TEAM_CREATE_RESET });
    dispatch({ type: TEAM_JOIN_RESET }); // Reset join state

    if (!userInfo) {
      navigate('/login');
    }

    if (successCreate) {
      setShowCreate(false);
      setCreateTeamName('');
      dispatch(listTeams()); // Refresh team list after creation
    }

    if (successJoin) {
        setShowJoin(false);
        setJoinTeamId('');
        dispatch(listTeams()); // Refresh team list after joining
    }

    if (successDelete) {
      dispatch({ type: TEAM_DELETE_SUCCESS }); // Reset success state for delete
      dispatch(listTeams()); // Refresh team list after deletion
    }

    dispatch(listTeams());
  }, [dispatch, navigate, userInfo, successCreate, successJoin, successDelete]);

  const handleCloseCreate = () => setShowCreate(false);
  const handleShowCreate = () => setShowCreate(true);

  const handleCloseJoin = () => setShowJoin(false);
  const handleShowJoin = () => setShowJoin(true);

  const submitCreateTeamHandler = (e) => {
    e.preventDefault();
    dispatch(createTeam(createTeamName));
  };

  const submitJoinTeamHandler = (e) => {
    e.preventDefault();
    dispatch(joinTeam(joinTeamId));
  };

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam(id));
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Teams</h1>
        </Col>
        <Col className="text-right">
          <Button className="my-3 mx-2" onClick={handleShowCreate}>
            <i className="fas fa-plus"></i> Create Team
          </Button>
          <Button className="my-3" onClick={handleShowJoin}>
            <i className="fas fa-user-plus"></i> Join Team
          </Button>
        </Col>
      </Row>

      {/* Create Team Modal */}
      <Modal show={showCreate} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCreate && <Loader />}
          {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
          <Form onSubmit={submitCreateTeamHandler}>
            <Form.Group controlId="createTeamName">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter team name"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Button type="submit" variant="primary" className='mt-3'>
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Join Team Modal */}
      <Modal show={showJoin} onHide={handleCloseJoin}>
        <Modal.Header closeButton>
          <Modal.Title>Join Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingJoin && <Loader />}
          {errorJoin && <Message variant='danger'>{errorJoin}</Message>}
          <Form onSubmit={submitJoinTeamHandler}>
            <Form.Group controlId="joinTeamId">
              <Form.Label>Team ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Team ID"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Button type="submit" variant="primary" className='mt-3'>
              Join
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team._id}>
                <td>{team._id}</td>
                <td>{team.name}</td>
                <td>
                  <LinkContainer to={`/team/${team._id}/edit`}>
                    <Button variant="light" className="btn-sm">
                      <i className="fas fa-edit"></i>
                    </Button>
                  </LinkContainer>
                  {userInfo && team.owner === userInfo._id && (
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(team._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TeamScreen;
