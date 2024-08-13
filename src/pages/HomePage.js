import React from 'react';
import Header from '../components/Header';
import Main from '../components/Main';
import AsideLeft from '../components/AsideLeft';
import AsideRight from '../components/AsideRight';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <AsideLeft />
        <Main />
        <AsideRight />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
