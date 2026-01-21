import axios from 'axios';
import { logout } from './userActions';
import {
  TEAM_LIST_REQUEST,
  TEAM_LIST_SUCCESS,
  TEAM_LIST_FAIL,
  TEAM_CREATE_REQUEST,
  TEAM_CREATE_SUCCESS,
  TEAM_CREATE_FAIL,
  TEAM_JOIN_REQUEST,
  TEAM_JOIN_SUCCESS,
  TEAM_JOIN_FAIL,
  TEAM_DELETE_REQUEST,
  TEAM_DELETE_SUCCESS,
  TEAM_DELETE_FAIL,
  TEAM_UPDATE_JOIN_REQUEST_REQUEST,
  TEAM_UPDATE_JOIN_REQUEST_SUCCESS,
  TEAM_UPDATE_JOIN_REQUEST_FAIL,
} from '../constants/teamConstants';

export const listTeams = () => async (dispatch, getState) => {
  try {
    dispatch({ type: TEAM_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const { data } = await axios.get('/api/teams', config);

    dispatch({
      type: TEAM_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({
      type: TEAM_LIST_FAIL,
      payload: message,
    });
  }
};

export const createTeam = (name) => async (dispatch, getState) => {
  try {
    dispatch({
      type: TEAM_CREATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/teams', { name }, config);

    dispatch({
      type: TEAM_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: TEAM_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const joinTeam = (teamId) => async (dispatch, getState) => {
  try {
    dispatch({
      type: TEAM_JOIN_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`/api/teams/${teamId}/join`, {}, config);

    dispatch({
      type: TEAM_JOIN_SUCCESS,
      payload: data.message, // The server now returns a message: 'Join request sent successfully'
    });
  } catch (error) {
    dispatch({
      type: TEAM_JOIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteTeam = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: TEAM_DELETE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/teams/${id}`, config);

    dispatch({
      type: TEAM_DELETE_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: TEAM_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateTeamJoinRequest = (teamId, userId, action) => async (dispatch, getState) => {
  try {
    dispatch({
      type: TEAM_UPDATE_JOIN_REQUEST_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/teams/${teamId}/join`, { userId, action }, config);

    dispatch({
      type: TEAM_UPDATE_JOIN_REQUEST_SUCCESS,
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: TEAM_UPDATE_JOIN_REQUEST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
