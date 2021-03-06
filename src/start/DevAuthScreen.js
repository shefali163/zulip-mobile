/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { ActivityIndicator, View, StyleSheet, FlatList } from 'react-native';

import type { Auth, DevUser, Dispatch, GlobalState } from '../types';
import { ErrorMsg, Label, Screen, ZulipButton } from '../common';
import { devListUsers, devFetchApiKey } from '../api';
import { getPartialAuth } from '../selectors';
import { loginSuccess } from '../actions';
import styles from '../styles';

const componentStyles = StyleSheet.create({
  accountItem: { height: 10 },
  heading: { flex: 0 },
  heading2: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

type Props = {|
  partialAuth: Auth,
  dispatch: Dispatch,
|};

type State = {|
  progress: boolean,
  directAdmins: DevUser[],
  directUsers: DevUser[],
  error: string,
|};

class DevAuthScreen extends PureComponent<Props, State> {
  state = {
    progress: false,
    directAdmins: [],
    directUsers: [],
    error: '',
  };

  componentDidMount = () => {
    const { partialAuth } = this.props;
    this.setState({ progress: true, error: undefined });

    (async () => {
      try {
        const response = await devListUsers(partialAuth);
        this.setState({
          directAdmins: response.direct_admins,
          directUsers: response.direct_users,
          progress: false,
        });
      } catch (err) {
        this.setState({ error: err.message });
      } finally {
        this.setState({ progress: false });
      }
    })();
  };

  tryDevLogin = async (email: string) => {
    const { partialAuth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await devFetchApiKey(partialAuth, email);
      this.props.dispatch(loginSuccess(partialAuth.realm, email, apiKey));
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { directAdmins, directUsers, error, progress } = this.state;

    return (
      <Screen title="Pick a dev account">
        <View style={componentStyles.container}>
          {progress && <ActivityIndicator />}
          {!!error && <ErrorMsg error={error} />}
          <Label
            style={[styles.field, componentStyles.heading2, componentStyles.heading]}
            text="Administrators"
          />
          {directAdmins.map(admin => (
            <ZulipButton
              key={admin.email}
              text={admin.email}
              onPress={() => this.tryDevLogin(admin.email)}
            />
          ))}
          <Label
            style={[styles.field, componentStyles.heading2, componentStyles.heading]}
            text="Normal users"
          />
          <FlatList
            data={directUsers.map(user => user.email)}
            keyExtractor={(item, index) => item}
            ItemSeparatorComponent={() => <View style={componentStyles.accountItem} />}
            renderItem={({ item }) => (
              <ZulipButton
                key={item}
                text={item}
                secondary
                onPress={() => this.tryDevLogin(item)}
              />
            )}
          />
        </View>
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  partialAuth: getPartialAuth(state),
}))(DevAuthScreen);
