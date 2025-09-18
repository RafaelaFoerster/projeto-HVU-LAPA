package br.edu.ufape.hvu.controller.dto.request;

import jakarta.validation.constraints.Email;
import org.modelmapper.ModelMapper;
import br.edu.ufape.hvu.config.SpringApplicationContext;
import br.edu.ufape.hvu.model.Usuario;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UsuarioRequest {
    private long id;
	@Email(message = "Forneça um endereço de email correto")
	private String email;
	private String senha;
	private String cpf;        // sem @NotBlank
	private String telefone;   // sem @NotBlank
	private String nome;       // sem @NotBlank
	private EnderecoRequest endereco;  // sem @NotNull

	public Usuario convertToEntity() {
		ModelMapper modelMapper = (ModelMapper) SpringApplicationContext.getBean("modelMapper");
        return modelMapper.map(this, Usuario.class);
	}
}

