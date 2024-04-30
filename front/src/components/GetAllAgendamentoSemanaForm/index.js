import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from "./index.module.css";
import dateStyles from "../Date/index.module.css";
import CalendarGreenIcon from '../CalendarGreenIcon';
import SearchBar from '../SearchBar';
import VoltarButton from '../VoltarButton';
import { DataCompleta } from "../Date";
import { getAllVaga } from '../../../services/vagaService';
import { cancelarAgendamento } from '../../../services/consultaService';
import { getTutorByAnimal } from '../../../services/tutorService';
import Filter from '../GetAgendamentosFilter';
import ModalAgendamento from '../ModalAgendamento';
import ErrorAlert from '../ErrorAlert';


function GetAllAgendamentosSemanaForm() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [vagas, setVagas] = useState([]);
  const [selectedVaga, setSelectedVaga] = useState(null);
  const [tutor, setTutor] = useState('');
  const [descricaoCancelamento, setDescricaoCancelamento] = useState('');

  const [showAlert, setShowAlert] = useState(false);

  const horarios = ['08:00', '09:00', '10:00', '11:00', '12:00'];
  const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dias = [];

  for (let i = 0; i < 7; i++) {
    const dia = new Date(dataSelecionada);
    dia.setDate(dataSelecionada.getDate() - dataSelecionada.getDay() + i);
    dias.push(dia);
  }

  const fetchData = async () => {
    try {
      const VagasData = await getAllVaga();
      setVagas(VagasData);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataSelecionada]);

  const getStatusColor = status => {
    switch (status) {
      case 'cancelado': return 'red';
      case 'precriada': return 'yellow';
      case 'Disponivel': return 'green';
      default: return 'grey'; // for null and unknown statuses
    }
  };

  const handleCancelarConsulta = async () => {
    try {
      const cancelamentoData = {
        descricao: descricaoCancelamento,
        agendamento: {
          id: selectedVaga.agendamento.id
        }
      };
      await cancelarAgendamento(cancelamentoData);
      closeModal();
      setShowAlert(true);
      fetchData();
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
    }
  };

  const openModal = async (vaga) => {
    setSelectedVaga(vaga);
    console.log(vaga)
    setModalOpen(true);
    if (vaga?.agendamento?.animal?.id) {
      try {
        const tutorSelected = await getTutorByAnimal(vaga.agendamento.animal.id);
        setTutor(tutorSelected);
      } catch (error) {
        console.error('Erro ao obter tutor:', error);
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setTutor("");
    setDescricaoCancelamento('');
  };

  return (
    <div className={styles.pagina}>

      <div className={styles.container}>
        <VoltarButton />
        <h1>Agendamentos da semana</h1>
        <div className={styles.calendar_container}>
          <div className={styles.calendar_box}>
            <div className={dateStyles.data_completa}>{DataCompleta(dataSelecionada)}</div>
            <CalendarGreenIcon onDataSelecionada={setDataSelecionada} />
          </div>
          <Filter />
        </div>
        <div className={styles.menu}>
          <div className={styles.button_options}>
            <button className={styles.button} onClick={(e) => router.push("/agendamentoEspecial")}>Novo agendamento</button>
            <button className={styles.button} onClick={(e) => router.push("/gerenciarVagas")}>Criar vagas</button>
          </div>
          <SearchBar />
        </div>


        <table className={styles.tabela}>
          <thead>
            <tr className={styles.linha1}>
              <th className={styles.coluna_l1}></th>
              {dias.map((dia, index) => (
                <th key={index}>
                  <div className={styles.coluna_l1}>
                    <h6>{diasDaSemana[dia.getDay()]}</h6>
                    <div>{`${dia.getDate().toString().padStart(2, '0')}/${(dia.getMonth() + 1).toString().padStart(2, '0')}`}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {horarios.map((horario, index) => (
              <tr key={index} className={styles.linha}>
                <th className={styles.coluna1}>{horario}</th>
                {dias.map(dia => {
                  const key = `${dia.toISOString().slice(0, 10)}T${horario}:00`;
                  const agendamentos = vagas.filter(vaga => vaga.dataHora.startsWith(key));
                  return (
                    <td key={dia.toISOString()} className={styles.th}>
                      {agendamentos.map((agendamento, idx) => (
                        <div key={idx} className={styles[agendamento.status.toLowerCase()]} onClick={() => openModal(agendamento)}>
                          <span>
                            {agendamento?.agendamento?.animal?.nome ? agendamento.agendamento.animal.nome : agendamento.status}
                          </span>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <ModalAgendamento
        tutor={tutor}
        selectedVaga={selectedVaga}
        isOpen={modalOpen}
        closeModal={closeModal}
        descricaoCancelamento={descricaoCancelamento}
        setDescricaoCancelamento={setDescricaoCancelamento}
        handleCancelarConsulta={handleCancelarConsulta}
      />

      {showAlert && <ErrorAlert message="Agendamento cancelado com sucesso!" show={showAlert} />}   

    </div>
  );
}

export default GetAllAgendamentosSemanaForm;
