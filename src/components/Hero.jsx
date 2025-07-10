const Hero = ({ children, background }) => (
    <div className="relative h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${background})` }}
      />
      {children}
    </div>
  );
  
  export default Hero;
  